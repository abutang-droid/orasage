<?php
/**
 * Plugin Name: OraSage Payment
 * Plugin URI: https://orasage.com
 * Description: OraSage 八字计算器支付对接 — postMessage 跨域支付 + 报告推送 + 用户中心
 * Version: 2.5.0
 * Author: OraSage
 * Text Domain: orasage-payment
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL v2 or later
 */

// ────────────────────────────────────────────────────────────────
// 安全：禁止直接访问
// ────────────────────────────────────────────────────────────────
defined('ABSPATH') or die('No direct access');

// ────────────────────────────────────────────────────────────────
// 常量配置
// ────────────────────────────────────────────────────────────────
define('ORASAGE_APP_IFRAME_ID', 'orasage-calculator');
define('ORASAGE_MODAL_CONTAINER_ID', 'orasage-payment-modal');
define('ORASAGE_CHECKOUT_IFRAME_ID', 'orasage-checkout-iframe');
define('ORASAGE_VERSION', '2.5.0');

// ────────────────────────────────────────────────────────────────
// 调试标记（确认插件已加载）
// ────────────────────────────────────────────────────────────────
add_action('wp_footer', function () {
    echo '<!-- ORASAGE_PAYMENT_' . esc_attr(ORASAGE_VERSION) . '_LOADED -->';
}, 1);

// ════════════════════════════════════════════════════════════════
// 0. custom_mode=app 标记持久化（Cookie）
//    WooCommerce add-to-cart 会重定向丢失 URL 参数，用 Cookie 保持标记
// ════════════════════════════════════════════════════════════════
add_action('init', function () {
    if (isset($_GET['custom_mode']) && $_GET['custom_mode'] === 'app') {
        setcookie('orasage_app_order', '1', [
            'expires'  => time() + 7200,
            'path'     => '/',
            'secure'   => is_ssl(),
            'httponly' => false,
            'samesite' => 'Lax',
        ]);
    }
});

// ════════════════════════════════════════════════════════════════
// 1. REST API — 报告推送 + 健康检查 + 订单验证
// ════════════════════════════════════════════════════════════════
add_action('rest_api_init', function () {

    // ── 健康检查 ──────────────────────────────────────────────
    register_rest_route('orasage/v1', '/ping', [
        'methods'             => 'GET',
        'callback'            => function () {
            return [
                'ok'      => true,
                'version' => ORASAGE_VERSION,
                'time'    => current_time('mysql'),
            ];
        },
        'permission_callback' => '__return_true',
    ]);

    // ── 保存报告 ──────────────────────────────────────────────
    register_rest_route('orasage/v1', '/save-report', [
        'methods'             => 'POST',
        'callback'            => 'orasage_save_report',
        'permission_callback' => '__return_true',
    ]);

    // ── 获取用户报告列表（需登录） ────────────────────────────
    register_rest_route('orasage/v1', '/my-reports', [
        'methods'             => 'GET',
        'callback'            => 'orasage_get_my_reports',
        'permission_callback' => function () {
            return is_user_logged_in();
        },
    ]);

    // ── 通过 token 获取报告（无需登录，公开访问） ──────────
    register_rest_route('orasage/v1', '/report-view/(?P<token>[a-f0-9]{40})', [
        'methods'             => 'GET',
        'callback'            => 'orasage_view_report_by_token',
        'permission_callback' => '__return_true',
    ]);

    // ── 验证 WooCommerce 订单（供计算器后端调用） ────────────
    register_rest_route('orasage/v1', '/verify-order', [
        'methods'             => 'POST',
        'callback'            => 'orasage_verify_order',
        'permission_callback' => '__return_true',
    ]);

    // ── 通过 email+token 获取报告列表（供计算器 /reports iframe 调用） ──
    register_rest_route('orasage/v1', '/reports-by-email', [
        'methods'             => 'POST',
        'callback'            => 'orasage_get_reports_by_email',
        'permission_callback' => '__return_true',
    ]);
});

// ════════════════════════════════════════════════════════════════
// 2. 报告保存（自动创建用户 + 邮件通知）
// ════════════════════════════════════════════════════════════════
function orasage_save_report($request) {
    $params = $request->get_json_params();

    $email       = sanitize_email($params['email'] ?? '');
    $name        = sanitize_text_field($params['name'] ?? '');
    $planType    = sanitize_text_field($params['planType'] ?? '');
    $price       = sanitize_text_field($params['price'] ?? '');
    $reportUrl   = esc_url_raw($params['report_url'] ?? '');
    $reportTitle = sanitize_text_field($params['report_title'] ?? '');
    $excerpt     = sanitize_text_field($params['excerpt'] ?? '');
    $createdAt   = sanitize_text_field($params['createdAt'] ?? '');

    if (empty($email) || empty($reportUrl)) {
        return new WP_Error(
            'missing_fields',
            'Email and report_url are required',
            ['status' => 400]
        );
    }

    // 查找或创建用户（以邮箱为用户名）
    $user = get_user_by('email', $email);
    if (!$user) {
        $username = sanitize_user(strstr($email, '@', true), true);
        if (username_exists($username)) {
            $username = $username . '_' . wp_rand(100, 999);
        }
        $user_id = wp_create_user($username, wp_generate_password(), $email);
        if (is_wp_error($user_id)) {
            return new WP_Error(
                'user_create_failed',
                'Failed to create user: ' . $user_id->get_error_message(),
                ['status' => 500]
            );
        }
        wp_update_user([
            'ID'           => $user_id,
            'display_name' => $name ?: $username,
        ]);
        wp_new_user_notification($user_id, null, 'both');
    } else {
        $user_id = $user->ID;
    }

    // 保存报告到用户 meta（不存全文，只存 URL + 标题 + 摘要）
    $reports = get_user_meta($user_id, 'orasage_reports', true) ?: [];
    if (!is_array($reports)) {
        $reports = [];
        update_user_meta($user_id, 'orasage_reports', $reports);
    }

    $timestamp    = $createdAt ?: current_time('mysql');
    $reportId     = wp_rand(10000, 99999) . '_' . time();
    $reports[]    = [
        'id'           => $reportId,
        'plan_type'    => $planType,
        'price'        => $price,
        'report_url'   => $reportUrl,
        'report_title' => $reportTitle,
        'excerpt'      => $excerpt,
        'created_at'   => $timestamp,
    ];
    update_user_meta($user_id, 'orasage_reports', $reports);

    // 可选：写入 WooCommerce 订单
    $orderId = intval($params['order_id'] ?? 0);
    if ($orderId) {
        $order = wc_get_order($orderId);
        if ($order && in_array($order->get_status(), ['completed', 'processing', 'on-hold'])) {
            $order->update_meta_data('_orasage_report_url', $reportUrl);
            $order->update_meta_data('_orasage_report_date', $timestamp);
            $order->save();
        }
    }

    return [
        'success'   => true,
        'user_id'   => $user_id,
        'report_id' => $reportId,
        'report_url' => $reportUrl,
        'message'   => 'Report saved successfully',
    ];
}

// ════════════════════════════════════════════════════════════════
// 1b. HMAC token 验证辅助函数
// ════════════════════════════════════════════════════════════════
function orasage_verify_email_token($email, $token) {
    $secret = defined('ORASAGE_REPORT_SECRET') ? ORASAGE_REPORT_SECRET : wp_salt('auth');
    $expected = hash_hmac('sha256', $email, $secret);
    return hash_equals($expected, $token);
}

// ════════════════════════════════════════════════════════════════
// 1c. 通过 email+token 获取报告列表（供计算器 iframe 调用）
// ════════════════════════════════════════════════════════════════
function orasage_get_reports_by_email($request) {
    $params = $request->get_json_params();
    $email  = sanitize_email($params['email'] ?? '');
    $token  = sanitize_text_field($params['token'] ?? '');

    if (!orasage_verify_email_token($email, $token)) {
        return new WP_Error('unauthorized', 'Invalid token', ['status' => 401]);
    }

    $user = get_user_by('email', $email);
    if (!$user) {
        return ['success' => true, 'total' => 0, 'reports' => []];
    }

    $reports = get_user_meta($user->ID, 'orasage_reports', true) ?: [];
    if (!is_array($reports)) $reports = [];

    usort($reports, function ($a, $b) {
        return strtotime($b['created_at'] ?? '') - strtotime($a['created_at'] ?? '');
    });

    $summary = array_map(function ($r) {
        return [
            'id'           => $r['id'] ?? '',
            'plan_type'    => $r['plan_type'] ?? '',
            'price'        => $r['price'] ?? '',
            'report_url'   => $r['report_url'] ?? '',
            'report_title' => $r['report_title'] ?? '',
            'excerpt'      => $r['excerpt'] ?? '',
            'created_at'   => $r['created_at'] ?? '',
        ];
    }, $reports);

    return ['success' => true, 'total' => count($summary), 'reports' => $summary];
}

// ════════════════════════════════════════════════════════════════
// 1d. 通过 email+token 获取单份报告详情
// ════════════════════════════════════════════════════════════════
function orasage_get_report_detail($request) {
    $email     = sanitize_email($request->get_param('email') ?? '');
    $token     = sanitize_text_field($request->get_param('token') ?? '');
    $report_id = sanitize_text_field($request->get_param('report_id') ?? '');

    if (!orasage_verify_email_token($email, $token)) {
        return new WP_Error('unauthorized', 'Invalid token', ['status' => 401]);
    }

    $user = get_user_by('email', $email);
    if (!$user) {
        return new WP_Error('not_found', 'User not found', ['status' => 404]);
    }

    $reports = get_user_meta($user->ID, 'orasage_reports', true) ?: [];
    if (!is_array($reports)) $reports = [];

    $found = null;
    foreach ($reports as $r) {
        if (($r['id'] ?? '') === $report_id) {
            $found = $r;
            break;
        }
    }

    if (!$found) {
        return new WP_Error('not_found', 'Report not found', ['status' => 404]);
    }

    return [
        'success' => true,
        'report'  => [
            'id'         => $found['id'] ?? '',
            'token'      => $found['token'] ?? '',
            'plan_type'  => $found['plan_type'] ?? '',
            'price'      => $found['price'] ?? '',
            'report'     => $found['report'] ?? '',
            'sections'   => $found['sections'] ?? [],
            'created_at' => $found['created_at'] ?? '',
        ],
    ];
}

// ════════════════════════════════════════════════════════════════
// 2b. 通过 token 查看报告（无需登录，公开页面）
// ════════════════════════════════════════════════════════════════
function orasage_view_report_by_token($request) {
    $token = $request->get_param('token');

    global $wpdb;
    $results = $wpdb->get_results($wpdb->prepare(
        "SELECT user_id, meta_value FROM {$wpdb->usermeta} WHERE meta_key = 'orasage_reports'"
    ));

    $found = null;
    foreach ($results as $row) {
        $reports = maybe_unserialize($row->meta_value);
        if (!is_array($reports)) continue;
        foreach ($reports as $r) {
            if (($r['token'] ?? '') === $token) {
                $found = $r;
                break 2;
            }
        }
    }

    if (!$found) {
        status_header(404);
        echo '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>报告未找到 - OraSage</title>';
        echo '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@400;500&display=swap" rel="stylesheet">';
        echo '<style>body{font-family:"Noto Sans SC",sans-serif;background:#F7F4FA;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}</style>';
        echo '</head><body><div style="text-align:center;background:#FFF;padding:3rem;border-radius:16px;box-shadow:0 4px 24px rgba(46,41,91,0.08);max-width:400px"><p style="font-size:1.2rem;color:#2E295B;margin:0 0 0.5rem">📭 报告未找到</p><p style="color:#7B7488;font-size:0.875rem;margin:0">此链接可能已过期或不存在。</p></div></body></html>';
        exit;
    }

    $plan_labels = ['basic' => '深度解读', 'advanced' => '能量手串', 'premium' => '终极能量礼盒'];
    $planLabel = $plan_labels[$found['plan_type'] ?? ''] ?? '命理报告';
    $date = $found['created_at'] ?? '';
    $content = wpautop($found['report'] ?? '');

    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . esc_html($planLabel) . ' - OraSage</title>';
    echo '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&family=Noto+Sans+SC:wght@300;400;500;600&display=swap" rel="stylesheet">';
    echo '<style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:"Noto Serif SC",serif;background:#F7F4FA;color:#3D3852;line-height:1.8}
    .container{max-width:720px;margin:2rem auto;padding:0 1rem}
    .card{background:#FFF;border-radius:16px;padding:2.5rem;box-shadow:0 4px 24px rgba(46,41,91,0.06);border:1px solid #E7E1EE;margin-bottom:1.5rem}
    .header{text-align:center;padding:2.5rem 1rem 1.5rem}
    .header h1{font-family:"Noto Serif SC",serif;font-size:1.6rem;color:#2E295B;margin-bottom:0.25rem}
    .header .meta{font-size:0.8rem;color:#7B7488}
    .header .badge{display:inline-block;background:rgba(217,164,65,0.1);color:#D9A441;padding:0.2rem 0.75rem;border-radius:999px;font-size:0.75rem;font-weight:600;margin-bottom:0.5rem}
    .report-content h2{font-family:"Noto Serif SC",serif;font-size:1.15rem;color:#2E295B;margin:1.75rem 0 0.75rem;padding-bottom:0.5rem;border-bottom:1px solid rgba(217,164,65,0.15)}
    .report-content h3{font-family:"Noto Serif SC",serif;font-size:1.05rem;color:#2E295B;margin:1.25rem 0 0.5rem}
    .report-content p{margin-bottom:0.75rem}
    .report-content ul,.report-content ol{padding-left:1.5rem;margin-bottom:0.75rem}
    .report-content li{margin-bottom:0.25rem}
    .footer{text-align:center;padding:1.5rem;font-size:0.7rem;color:#7B7488;font-family:"Noto Sans SC",sans-serif}
    .footer a{color:#D9A441;text-decoration:none}
    @media(max-width:640px){.card{padding:1.5rem}.container{margin:1rem auto}}
    </style>';
    echo '</head><body>';
    echo '<div class="header"><div class="badge">' . esc_html($planLabel) . '</div><h1>OraSage 命理报告</h1>';
    if ($date) echo '<p class="meta">生成于 ' . esc_html($date) . '</p>';
    echo '</div>';
    echo '<div class="container"><div class="card"><div class="report-content">' . $content . '</div></div></div>';
    echo '<div class="footer"><p>由 <a href="' . esc_url(home_url()) . '">OraSage</a> 生成 · 仅供参考</p></div>';
    echo '</body></html>';
    exit;
}

// ════════════════════════════════════════════════════════════════


// ════════════════════════════════════════════════════════════════
// 3. 获取用户报告列表
// ════════════════════════════════════════════════════════════════
function orasage_get_my_reports() {
    $user_id  = get_current_user_id();
    $reports  = get_user_meta($user_id, 'orasage_reports', true) ?: [];

    // 按创建时间倒序
    usort($reports, function ($a, $b) {
        return strtotime($b['created_at'] ?? '') - strtotime($a['created_at'] ?? '');
    });

    $summary = array_map(function ($r) {
        return [
            'id'           => $r['id'] ?? '',
            'plan_type'    => $r['plan_type'] ?? '',
            'price'        => $r['price'] ?? '',
            'report_url'   => $r['report_url'] ?? '',
            'report_title' => $r['report_title'] ?? '',
            'excerpt'      => $r['excerpt'] ?? '',
            'created_at'   => $r['created_at'] ?? '',
        ];
    }, $reports);

    return [
        'success' => true,
        'total'   => count($summary),
        'reports' => $summary,
    ];
}

// ════════════════════════════════════════════════════════════════
// 4. 获取单份报告详情
// ════════════════════════════════════════════════════════════════
function orasage_get_report($request) {
    $report_id = $request->get_param('id');
    $user_id   = get_current_user_id();
    $reports   = get_user_meta($user_id, 'orasage_reports', true) ?: [];

    $found = null;
    foreach ($reports as $idx => $r) {
        if (($r['id'] ?? '') === $report_id) {
            $found = $r;
            $found['index'] = $idx;
            break;
        }
    }

    if (!$found) {
        return new WP_Error(
            'not_found',
            'Report not found or you do not have permission',
            ['status' => 404]
        );
    }

    return [
        'success' => true,
        'report'  => $found,
    ];
}

// ════════════════════════════════════════════════════════════════
// 5. 验证 WooCommerce 订单（供计算器后端二次验证）
// ════════════════════════════════════════════════════════════════
function orasage_verify_order($request) {
    $params   = $request->get_json_params();
    $order_id = intval($params['orderId'] ?? $params['order_id'] ?? 0);
    $planType = sanitize_text_field($params['planType'] ?? '');

    if (!$order_id) {
        return new WP_Error(
            'invalid_order',
            'Order ID is required',
            ['status' => 400]
        );
    }

    // 获取 WooCommerce 订单
    $order = wc_get_order($order_id);
    if (!$order) {
        return [
            'verified' => false,
            'error'    => 'Order not found',
        ];
    }

    // 检查订单状态
    $valid_statuses = ['completed', 'processing'];
    if (!in_array($order->get_status(), $valid_statuses, true)) {
        return [
            'verified' => false,
            'error'    => 'Order not paid (status: ' . $order->get_status() . ')',
        ];
    }

    // 校验商品 ID 映射
    $product_id_map = [
        'basic'    => [342],
        'advanced' => [486, 2226],  // 486=单人, 2226=双人
        'premium'  => [488, 3591],  // 488=单人, 3591=双人
    ];

    $order_product_ids = [];
    foreach ($order->get_items() as $item) {
        $order_product_ids[] = $item->get_product_id();
    }

    if (!empty($planType) && isset($product_id_map[$planType])) {
        $allowed = $product_id_map[$planType];
        $matched = !empty(array_intersect($order_product_ids, $allowed));
    } else {
        // 不限定 planType 时，只要命中任一已知商品即通过
        $all_allowed = array_merge(...array_values($product_id_map));
        $matched     = !empty(array_intersect($order_product_ids, $all_allowed));
    }

    return [
        'verified'   => $matched,
        'order_id'   => $order_id,
        'status'     => $order->get_status(),
        'total'      => $order->get_total(),
        'product_ids' => $order_product_ids,
        'email'      => $order->get_billing_email(),
        'name'       => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
    ];
}

// ════════════════════════════════════════════════════════════════
// 6. 页面底部注入 Modal 弹窗 + 结算 iframe
// ════════════════════════════════════════════════════════════════
add_action('wp_footer', 'orasage_inject_payment_modal');

function orasage_inject_payment_modal() {
    $app_iframe_id   = esc_js(ORASAGE_APP_IFRAME_ID);
    $modal_id        = esc_js(ORASAGE_MODAL_CONTAINER_ID);
    $checkout_iframe = esc_js(ORASAGE_CHECKOUT_IFRAME_ID);
    ?>
    <!-- OraSage Payment Modal v<?php echo esc_html(ORASAGE_VERSION); ?> -->
    <div id="<?php echo esc_attr(ORASAGE_MODAL_CONTAINER_ID); ?>"
         style="display:none; position:fixed; top:0; left:0; width:100%; height:100%;
                background:rgba(14,12,9,0.65); z-index:999999;
                backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px);">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);
                    background:#FFFFFF; padding:24px; width:90%; max-width:520px;
                    border-radius:16px; box-shadow:0 8px 48px rgba(46,41,91,0.18);
                    border:1px solid rgba(217,164,65,0.15);">

            <!-- 头部 -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <!-- OraSage 图标（内联 SVG 太极） -->
                    <svg width="24" height="24" viewBox="0 0 100 100" fill="none" style="flex-shrink:0;">
                        <circle cx="50" cy="50" r="46" stroke="rgba(217,164,65,0.4)" stroke-width="1.5"/>
                        <path d="M50 4 A46 46 0 0 1 50 96 A23 23 0 0 1 50 50 A23 23 0 0 0 50 4Z" fill="rgba(217,164,65,0.15)"/>
                        <circle cx="50" cy="27" r="4" fill="rgba(217,164,65,0.8)"/>
                        <circle cx="50" cy="73" r="4" fill="rgba(217,164,65,0.25)"/>
                    </svg>
                    <div>
                        <h3 style="margin:0; font-size:16px; font-family:'Georgia',serif;
                                   color:#2E295B; letter-spacing:0.08em; font-weight:600;">
                            OraSage
                        </h3>
                        <p style="margin:0; font-size:11px; color:#7B7488;"><?php esc_html_e('Complete Purchase', 'orasage-payment'); ?></p>
                    </div>
                </div>
                <span id="<?php echo esc_attr(ORASAGE_CHECKOUT_IFRAME_ID); ?>-close-btn"
                      style="cursor:pointer; font-size:22px; line-height:1; color:#888;
                             padding:0 8px; border-radius:50%; width:32px; height:32px;
                             display:flex; align-items:center; justify-content:center;
                             transition:background 0.2s;"
                      onmouseover="this.style.background='rgba(217,164,65,0.08)'"
                      onmouseout="this.style.background='transparent'">&times;</span>
            </div>

            <!-- 结算 iframe -->
            <iframe id="<?php echo esc_attr(ORASAGE_CHECKOUT_IFRAME_ID); ?>"
                    src=""
                    style="width:100%; height:480px; border:none; border-radius:8px;
                           background:#F7F4FA;"
                    title="Checkout"></iframe>

            <!-- 底部安全提示 -->
            <div style="display:flex; align-items:center; gap:6px; margin-top:12px;
                        padding-top:12px; border-top:1px solid rgba(217,164,65,0.1);">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                     stroke="rgba(93,89,115,0.5)" stroke-width="1.8"
                     stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span style="font-size:10px; color:rgba(93,89,115,0.5);">
                    <?php esc_html_e('Secure payment powered by WooCommerce', 'orasage-payment'); ?>
                </span>
            </div>
        </div>
    </div>

    <script>
    (function() {
        'use strict';

        var APP_IFRAME_ID    = '<?php echo $app_iframe_id; ?>';
        var MODAL_ID          = '<?php echo $modal_id; ?>';
        var CHECKOUT_IFRAME   = '<?php echo $checkout_iframe; ?>';
        var CLOSE_BTN         = CHECKOUT_IFRAME + '-close-btn';

        // 函数：获取 Modal 元素（可能页面尚未加载）
        function getModal() {
            return document.getElementById(MODAL_ID);
        }
        function getCheckoutWin() {
            return document.getElementById(CHECKOUT_IFRAME);
        }
        function getAppFrame() {
            return document.getElementById(APP_IFRAME_ID);
        }

        // ── 监听来自计算器 iframe 的 postMessage ──────────────
        window.addEventListener('message', function(event) {
            var data = event.data;
            if (!data || !data.action) return;

            console.log('[OraSage WP] postMessage received:', data.action, 'origin:', event.origin);

            // ── iframe 高度自适应 ───────────────────────────────
            if (data.action === 'SET_IFRAME_HEIGHT') {
                var appFrame = getAppFrame();
                // 只处理来自计算器 iframe 的消息，不处理用户中心 reports iframe
                if (appFrame && data.height && event.source === appFrame.contentWindow) {
                    // 加 40px 余量避免底部截断
                    appFrame.style.height = (data.height + 40) + 'px';
                    // 移除之前可能设置的固定高度
                    appFrame.style.minHeight = 'auto';
                }
                return;
            }

            // source 校验：只在 OPEN_WP_PAYMENT 时严格校验 source
            // 对于支付成功信号不做 source 校验（因为 ThankYou 页面可能在另一个域）
            if (data.action === 'OPEN_WP_PAYMENT') {
                var appFrame = getAppFrame();
                // 宽松校验：允许 source 为空（某些跨域嵌套场景）或匹配计算器 iframe
                var isFromCalculator = false;
                if (appFrame && event.source === appFrame.contentWindow) {
                    isFromCalculator = true;
                }
                // 也允许任何子 iframe 的消息通过（在多层嵌套场景下）
                if (!isFromCalculator && !appFrame) {
                    // 没有找到计算器 iframe，仍然尝试处理（可能在动态加载中）
                }

                var productId = data.productId;
                if (!productId) {
                    console.error('[OraSage] Missing productId in OPEN_WP_PAYMENT');
                    return;
                }
                // 构建 WooCommerce 自动加购结算链接
                var checkoutUrl = '/checkout/?add-to-cart=' +
                    encodeURIComponent(productId) + '&custom_mode=app';
                var checkoutWin = getCheckoutWin();
                var modal = getModal();
                if (checkoutWin) checkoutWin.src = checkoutUrl;
                if (modal) modal.style.display = 'block';
            }
        });

        // ── 关闭 Modal ────────────────────────────────────────
        function closeModal() {
            var modal = getModal();
            var checkoutWin = getCheckoutWin();
            var appFrame = getAppFrame();
            if (modal) modal.style.display = 'none';
            if (checkoutWin) checkoutWin.src = '';
            // 通知计算器 Modal 已关闭
            if (appFrame && appFrame.contentWindow) {
                try {
                    appFrame.contentWindow.postMessage({
                        action: 'WP_PAYMENT_CLOSED'
                    }, '*');
                } catch (e) { /* ignore cross-origin */ }
            }
        }

        // ── 关闭按钮 ───────────────────────────────────────────
        (function() {
            var closeBtnEl = document.getElementById(CLOSE_BTN);
            if (!closeBtnEl) {
                // 延迟查找（DOM 可能尚未渲染到）
                setTimeout(function() {
                    closeBtnEl = document.getElementById(CLOSE_BTN);
                    if (closeBtnEl) bindCloseBtn(closeBtnEl);
                }, 100);
                return;
            }
            bindCloseBtn(closeBtnEl);
        })();

        function bindCloseBtn(el) {
            el.addEventListener('click', function() {
                var appFrame = getAppFrame();
                // 发送取消信号
                if (appFrame && appFrame.contentWindow) {
                    try {
                        appFrame.contentWindow.postMessage({
                            action: 'WP_PAYMENT_FAILED'
                        }, '*');
                    } catch (e) { /* ignore */ }
                }
                closeModal();
            });
        }

        // ── 点击 Modal 背景关闭 ────────────────────────────────
        (function() {
            var modal = getModal();
            if (!modal) {
                setTimeout(function() {
                    var m = getModal();
                    if (m) bindModalBgClose(m);
                }, 100);
                return;
            }
            bindModalBgClose(modal);
        })();

        function bindModalBgClose(modal) {
            modal.addEventListener('click', function(e) {
                if (e.target !== modal) return;
                var appFrame = getAppFrame();
                if (appFrame && appFrame.contentWindow) {
                    try {
                        appFrame.contentWindow.postMessage({
                            action: 'WP_PAYMENT_FAILED'
                        }, '*');
                    } catch (e) { /* ignore */ }
                }
                closeModal();
            });
        }

        // ── ESC 键关闭 ─────────────────────────────────────────
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                var modal = getModal();
                if (modal && modal.style.display === 'block') {
                    var appFrame = getAppFrame();
                    if (appFrame && appFrame.contentWindow) {
                        try {
                            appFrame.contentWindow.postMessage({
                                action: 'WP_PAYMENT_FAILED'
                            }, '*');
                        } catch (e) { /* ignore */ }
                    }
                    closeModal();
                }
            }
        });

        console.log('[OraSage] Payment modal initialized ✓');
    })();
    </script>
    <?php
}

// ════════════════════════════════════════════════════════════════
// 7. 拦截 WooCommerce ThankYou 页面，发送成功信号
// ════════════════════════════════════════════════════════════════
add_action('woocommerce_thankyou', 'orasage_handle_payment_success', 10, 1);

function orasage_handle_payment_success($order_id) {
    // 检查 Cookie 标记（而非易丢失的 URL 参数）
    if (!isset($_COOKIE['orasage_app_order']) || $_COOKIE['orasage_app_order'] !== '1') {
        return;
    }
    // 立即清理 Cookie，避免后续普通订单误触发
    setcookie('orasage_app_order', '', [
        'expires'  => time() - 3600,
        'path'     => '/',
        'secure'   => is_ssl(),
        'httponly' => false,
        'samesite' => 'Lax',
    ]);

    $app_iframe_id   = esc_js(ORASAGE_APP_IFRAME_ID);
    $modal_id        = esc_js(ORASAGE_MODAL_CONTAINER_ID);
    $checkout_iframe = esc_js(ORASAGE_CHECKOUT_IFRAME_ID);
    $safe_order_id   = esc_js((string) $order_id);
    $buyer_email     = '';
    $buyer_name      = '';

    // 从订单获取购买者 email 和姓名（传递给计算器，避免计算器反查 WC API）
    $order = wc_get_order($order_id);
    if ($order) {
        $buyer_email = esc_js($order->get_billing_email() ?? '');
        $fn = $order->get_billing_first_name() ?? '';
        $ln = $order->get_billing_last_name() ?? '';
        $buyer_name  = esc_js(($fn || $ln) ? trim($fn . ' ' . $ln) : '');
    }

    ?>
    <script>
    (function() {
        'use strict';

        var APP_IFRAME_ID  = '<?php echo $app_iframe_id; ?>';
        var MODAL_ID        = '<?php echo $modal_id; ?>';
        var CHECKOUT_IFRAME = '<?php echo $checkout_iframe; ?>';
        var ORDER_ID        = '<?php echo $safe_order_id; ?>';
        var BUYER_EMAIL     = '<?php echo $buyer_email; ?>';
        var BUYER_NAME      = '<?php echo $buyer_name; ?>';

        // 1. 向计算器 iframe 发送支付成功信号
        // 结算 iframe 嵌套在两层的 Modal 中，需要同时尝试 parent 和 top
        function sendSuccessToCalculator() {
            var targets = [window.parent];
            try { if (window.top && window.top !== window.parent) targets.push(window.top); } catch(e) {}
            for (var t = 0; t < targets.length; t++) {
                try {
                    var appFrame = targets[t].document.getElementById(APP_IFRAME_ID);
                    if (appFrame && appFrame.contentWindow) {
                        appFrame.contentWindow.postMessage({
                            action:  'WP_PAYMENT_SUCCESS',
                            orderId: ORDER_ID,
                            email:   BUYER_EMAIL,
                            name:    BUYER_NAME
                        }, '*');
                        console.log('[OraSage] Payment success signal sent to calculator via target ' + t);
                        return true;
                    }
                } catch(e) { /* cross-origin */ }
            }
            console.error('[OraSage] Cannot find calculator iframe #' + APP_IFRAME_ID + ' in any parent window');
            return false;
        }
        sendSuccessToCalculator();

        // 2. 自动关闭 Modal 并清空结算 iframe
        setTimeout(function() {
            var targets = [window.parent];
            try { if (window.top && window.top !== window.parent) targets.push(window.top); } catch(e) {}
            for (var t = 0; t < targets.length; t++) {
                try {
                    var modal = targets[t].document.getElementById(MODAL_ID);
                    if (modal) { modal.style.display = 'none'; console.log('[OraSage] Auto-closed payment modal'); }
                    var checkoutFrame = targets[t].document.getElementById(CHECKOUT_IFRAME);
                    if (checkoutFrame) { checkoutFrame.src = ''; console.log('[OraSage] Cleared checkout iframe'); }
                } catch(e) {}
            }
        }, 100);

        console.log('[OraSage] Payment success for order #' + ORDER_ID);
    })();
    </script>
    <?php
}

// ════════════════════════════════════════════════════════════════
// 8. WooCommerce 商品 ID 映射 helper（供主题/其他插件使用）
// ════════════════════════════════════════════════════════════════
function orasage_get_product_id_mapping(): array {
    return [
        'single' => [
            'basic'    => 342,
            'advanced' => 486,
            'premium'  => 488,
        ],
        'couple' => [
            'basic'    => 342,
            'advanced' => 2226,
            'premium'  => 3591,
        ],
    ];
}

// ════════════════════════════════════════════════════════════════
// 9. 注册「我的报告」作为 WooCommerce My Account 独立导航标签
// ════════════════════════════════════════════════════════════════

// 注册自定义 endpoint（每次 init 时注册，不依赖 flush_rewrite_rules）
add_action('init', function () {
    add_rewrite_endpoint('orasage-reports', EP_ROOT | EP_PAGES);
});

// 强制立即生效：插件激活/更新时如果 rewrite 未包含该 endpoint 就刷新
add_action('wp_loaded', function () {
    $rules = get_option('rewrite_rules');
    if (!$rules || !is_array($rules)) return;
    $hasEndpoint = false;
    foreach ($rules as $pattern => $query) {
        if (strpos($pattern, 'orasage-reports') !== false) {
            $hasEndpoint = true;
            break;
        }
    }
    if (!$hasEndpoint) {
        flush_rewrite_rules();
    }
});

// 将 endpoint 加入 WooCommerce 导航菜单
add_filter('woocommerce_account_menu_items', function ($items) {
    // 在「下载」后面插入「我的报告」
    $new = [];
    foreach ($items as $key => $label) {
        $new[$key] = $label;
        if ($key === 'downloads') {
            $new['orasage-reports'] = '我的报告';
        }
    }
    return $new;
});

// 渲染「我的报告」页面内容 — PHP 直接渲染列表，新开窗打开报告
add_action('woocommerce_account_orasage-reports_endpoint', function () {
    if (!is_user_logged_in()) {
        echo '<div style="padding:2rem; text-align:center; background:#F7F4FA; border-radius:12px; color:#5D5973;">' .
             '<p style="font-size:1.1rem; margin-bottom:1rem;">请先登录以查看您的命理报告。</p>' .
             '<a href="' . esc_url(wp_login_url(get_permalink())) . '" style="display:inline-block; padding:0.75rem 2rem; background:#D9A441; color:#FFF; border-radius:8px; text-decoration:none; font-weight:600;">登录 / 注册</a>' .
             '</div>';
        return;
    }

    $user_id = get_current_user_id();
    $reports = get_user_meta($user_id, 'orasage_reports', true) ?: [];
    if (!is_array($reports)) $reports = [];

    if (empty($reports)) {
        echo '<div style="padding:3rem; text-align:center; background:#F7F4FA; border-radius:12px; color:#5D5973;">' .
             '<p style="font-size:1.1rem;">暂无命理报告。</p>' .
             '<p style="font-size:0.875rem; margin-top:0.5rem;">完成一次排盘并购买后，报告将自动出现在这里。</p>' .
             '</div>';
        return;
    }

    usort($reports, function ($a, $b) {
        return strtotime($b['created_at'] ?? '') - strtotime($a['created_at'] ?? '');
    });

    $plan_labels = ['basic' => '深度解读', 'advanced' => '能量手串', 'premium' => '终极能量礼盒'];

    echo '<div style="font-family:\'Noto Sans SC\',sans-serif; max-width:680px; margin:0 auto;">';
    echo '<div style="text-align:center; margin-bottom:1rem;">';
    echo '<h2 style="font-size:1.1rem; font-weight:700; color:#2E295B; margin:0 0 0.2rem; font-family:\'Noto Serif SC\',serif;">我的报告</h2>';
    echo '<p style="font-size:0.7rem; color:#7B7488; margin:0;">共 ' . count($reports) . ' 份命理报告</p>';
    echo '</div>';
    echo '<div style="display:flex; flex-direction:column; gap:0.75rem;">';

    foreach ($reports as $r) {
        $plan      = $r['plan_type'] ?? '';
        $planLabel = $plan_labels[$plan] ?? $plan;
        $price     = $r['price'] ?? '';
        $date      = $r['created_at'] ?? '';
        $title     = $r['report_title'] ?? ($planLabel . '报告');
        $excerpt   = $r['excerpt'] ?? '';
        $reportUrl = $r['report_url'] ?? '';

        echo '<div style="background:#FFF; border:1px solid rgba(217,164,65,0.15); border-radius:14px; padding:1.1rem; box-shadow:0 2px 12px rgba(46,41,91,0.05);">';
        echo '<div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">';
        echo '<span style="font-size:0.7rem; font-weight:600; color:#D9A441; background:rgba(217,164,65,0.08); padding:2px 10px; border-radius:999px;">' . esc_html($planLabel) . '</span>';
        if ($date) echo '<span style="font-size:0.65rem; color:#7B7488;">' . esc_html($date) . '</span>';
        echo '</div>';
        if ($price) echo '<p style="font-size:0.8rem; color:#3D3A5C; margin-bottom:0.5rem;">¥<strong style="color:#D9A441;">' . esc_html($price) . '</strong></p>';
        if ($title) echo '<p style="font-size:0.85rem; color:#2E295B; font-weight:600; margin:0 0 0.3rem; font-family:\'Noto Serif SC\',serif;">' . esc_html($title) . '</p>';
        if ($excerpt) echo '<p style="font-size:0.75rem; color:#7B7488; line-height:1.6; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; margin:0 0 0.75rem;">' . esc_html($excerpt) . '</p>';
        if ($reportUrl) {
            echo '<a href="' . esc_url($reportUrl) . '" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:0.3rem; padding:0.5rem 1.25rem; background:#D9A441; color:#FFF; border-radius:8px; text-decoration:none; font-size:0.75rem; font-weight:600; font-family:\'Noto Sans SC\',sans-serif;">';
            echo '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';
            echo '查看报告 →</a>';
        }
        echo '</div>';
    }

    echo '</div>';
    echo '<div style="text-align:center; margin-top:2rem; padding-bottom:1rem;">';
    echo '<p style="font-size:0.65rem; color:#7B7488; margin:0; opacity:0.6;">由 <span style="color:#D9A441;">OraSage</span> 提供 · 仅供参考</p>';
    echo '</div>';
    echo '</div>';
});

// 刷新 rewrite（插件激活时）
add_action('orasage_flush_rewrite', function () {
    flush_rewrite_rules();
});

// ─── 短代码（保留兼容） ───
add_shortcode('orasage_my_reports', 'orasage_my_reports_shortcode');

function orasage_my_reports_shortcode(): string {
    if (!is_user_logged_in()) {
        return '<div class="orasage-login-prompt" style="padding:2rem; text-align:center; background:#F7F4FA; border-radius:12px; color:#5D5973;">' .
               '<p style="font-size:1.1rem; margin-bottom:1rem;">请先登录以查看您的命理报告。</p>' .
               '<a href="' . esc_url(wp_login_url(get_permalink())) . '" style="display:inline-block; padding:0.75rem 2rem; background:#D9A441; color:#FFF; border-radius:8px; text-decoration:none; font-weight:600;">登录 / 注册</a>' .
               '</div>';
    }

    $user_id = get_current_user_id();
    $reports = get_user_meta($user_id, 'orasage_reports', true) ?: [];
    if (!is_array($reports)) $reports = [];

    if (empty($reports)) {
        return '<div style="padding:3rem; text-align:center; background:#F7F4FA; border-radius:12px; color:#5D5973;">' .
               '<p style="font-size:1.1rem;">暂无命理报告。</p>' .
               '<p style="font-size:0.875rem; margin-top:0.5rem;">完成一次排盘并购买后，报告将自动出现在这里。</p>' .
               '</div>';
    }

    usort($reports, function ($a, $b) {
        return strtotime($b['created_at'] ?? '') - strtotime($a['created_at'] ?? '');
    });

    $plan_labels = ['basic' => '深度解读', 'advanced' => '能量手串', 'premium' => '终极能量礼盒'];

    $html = '<div style="font-family:\'Noto Sans SC\',sans-serif;">';
    $html .= '<h2 style="font-size:1.1rem; font-weight:700; color:#2E295B; margin:0 0 0.75rem; font-family:\'Noto Serif SC\',serif;">我的报告</h2>';
    $html .= '<div style="display:flex; flex-direction:column; gap:0.75rem;">';

    foreach ($reports as $r) {
        $plan      = $r['plan_type'] ?? '';
        $planLabel = $plan_labels[$plan] ?? $plan;
        $price     = $r['price'] ?? '';
        $date      = $r['created_at'] ?? '';
        $title     = $r['report_title'] ?? ($planLabel . '报告');
        $excerpt   = $r['excerpt'] ?? '';
        $reportUrl = $r['report_url'] ?? '';

        $html .= '<div style="background:#FFF; border:1px solid rgba(217,164,65,0.15); border-radius:14px; padding:1.1rem; box-shadow:0 2px 12px rgba(46,41,91,0.05);">';
        $html .= '<div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">';
        $html .= '<span style="font-size:0.7rem; font-weight:600; color:#D9A441; background:rgba(217,164,65,0.08); padding:2px 10px; border-radius:999px;">' . esc_html($planLabel) . '</span>';
        if ($date) $html .= '<span style="font-size:0.65rem; color:#7B7488;">' . esc_html($date) . '</span>';
        $html .= '</div>';
        if ($price) $html .= '<p style="font-size:0.8rem; color:#3D3A5C; margin-bottom:0.5rem;">¥<strong style="color:#D9A441;">' . esc_html($price) . '</strong></p>';
        if ($title) $html .= '<p style="font-size:0.85rem; color:#2E295B; font-weight:600; margin:0 0 0.3rem; font-family:\'Noto Serif SC\',serif;">' . esc_html($title) . '</p>';
        if ($excerpt) $html .= '<p style="font-size:0.75rem; color:#7B7488; line-height:1.6; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; margin:0 0 0.75rem;">' . esc_html($excerpt) . '</p>';
        if ($reportUrl) {
            $html .= '<a href="' . esc_url($reportUrl) . '" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:0.3rem; padding:0.5rem 1.25rem; background:#D9A441; color:#FFF; border-radius:8px; text-decoration:none; font-size:0.75rem; font-weight:600;">查看报告 →</a>';
        }
        $html .= '</div>';
    }

    $html .= '</div></div>';
    return $html;
}

// ════════════════════════════════════════════════════════════════
// 10. 插件激活时初始化
// ════════════════════════════════════════════════════════════════
register_activation_hook(__FILE__, 'orasage_plugin_activate');

function orasage_plugin_activate() {
    // 确保 WooCommerce 已激活
    if (!class_exists('WooCommerce')) {
        deactivate_plugins(plugin_basename(__FILE__));
        wp_die(
            'OraSage Payment 需要 WooCommerce 插件。请先安装并激活 WooCommerce。',
            '依赖缺失',
            ['back_link' => true]
        );
    }

    // 设置选项标记
    update_option('orasage_payment_version', ORASAGE_VERSION);
    update_option('orasage_payment_activated', current_time('mysql'));

    // 刷新 rewrite 规则以确保 REST API 可用
    flush_rewrite_rules();
}

// ════════════════════════════════════════════════════════════════
// 11. 插件停用时清理
// ════════════════════════════════════════════════════════════════
register_deactivation_hook(__FILE__, 'orasage_plugin_deactivate');

function orasage_plugin_deactivate() {
    flush_rewrite_rules();
}
