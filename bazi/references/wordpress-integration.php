<?php
/**
 * OraSage 计算器支付对接 — WordPress 主题 functions.php
 *
 * 将此文件内容添加到你的 WordPress 主题 functions.php 中。
 * 功能：
 * 1. 在页面中注入 Modal 弹窗 + iframe 结算容器
 * 2. 监听 postMessage 信号，弹出 WooCommerce 结算 Modal
 * 3. 拦截支付成功页面，向下内嵌应用发送支付成功信号
 * 4. 注册 REST API 用于接收报告推送
 */

// ============================================================
// 配置：在这里修改你的内嵌应用 iframe ID
// ============================================================
define('ORASAGE_APP_IFRAME_ID', 'orasage-calculator'); // 计算器 iframe 的 id
define('ORASAGE_MODAL_CONTAINER_ID', 'orasage-payment-modal'); // Modal 容器 ID

// ============================================================
// 1. 在页面底部注入 Modal 弹窗 HTML + JS
// ============================================================
add_action('wp_footer', 'orasage_inject_payment_modal');

function orasage_inject_payment_modal() {
    ?>
    <div id="<?php echo esc_attr(ORASAGE_MODAL_CONTAINER_ID); ?>"
         style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:999999;">
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); background:#fff; padding:24px; width:90%; max-width:520px; border-radius:12px; box-shadow:0 8px 40px rgba(0,0,0,0.15);">

            <!-- 关闭按钮 -->
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
                <h3 style="margin:0; font-size:18px;">Complete Your Purchase</h3>
                <span id="orasage-close-modal"
                      style="cursor:pointer; font-size:22px; line-height:1; color:#888; padding:0 8px;">&times;</span>
            </div>

            <!-- 结算 iframe -->
            <iframe id="orasage-checkout-iframe"
                    src=""
                    style="width:100%; height:480px; border:none; border-radius:8px;"></iframe>
        </div>
    </div>

    <script>
    (function() {
        var APP_IFRAME_ID = '<?php echo esc_js(ORASAGE_APP_IFRAME_ID); ?>';
        var MODAL_ID       = '<?php echo esc_js(ORASAGE_MODAL_CONTAINER_ID); ?>';
        var WP_DOMAIN      = '<?php echo esc_js(home_url()); ?>';

        // 监听来自内嵌应用的 postMessage
        window.addEventListener('message', function(event) {
            // 安全校验：只处理来自计算器的消息
            var appFrame = document.getElementById(APP_IFRAME_ID);
            if (!appFrame) return;

            // 验证发送源是否是计算器 iframe
            if (event.source !== appFrame.contentWindow) return;

            if (event.data.action === 'OPEN_WP_PAYMENT') {
                var productId = event.data.productId;
                // 构建 WooCommerce 自动加购结算链接
                var checkoutUrl = '/checkout/?add-to-cart=' + productId + '&custom_mode=app';
                document.getElementById('orasage-checkout-iframe').src = checkoutUrl;
                document.getElementById(MODAL_ID).style.display = 'block';
            }
        });

        // 关闭 Modal
        document.getElementById('orasage-close-modal').addEventListener('click', function() {
            document.getElementById(MODAL_ID).style.display = 'none';
            document.getElementById('orasage-checkout-iframe').src = '';
            // 通知计算器支付取消
            var appWin = document.getElementById(APP_IFRAME_ID).contentWindow;
            if (appWin) {
                appWin.postMessage({ action: 'WP_PAYMENT_FAILED' }, '*');
            }
        });

        // 点击 Modal 背景也关闭
        document.getElementById(MODAL_ID).addEventListener('click', function(e) {
            if (e.target === this) {
                document.getElementById(MODAL_ID).style.display = 'none';
                document.getElementById('orasage-checkout-iframe').src = '';
                var appWin = document.getElementById(APP_IFRAME_ID).contentWindow;
                if (appWin) {
                    appWin.postMessage({ action: 'WP_PAYMENT_FAILED' }, '*');
                }
            }
        });
    })();
    </script>
    <?php
}

// ============================================================
// 2. 拦截 WooCommerce ThankYou 页面，发送成功信号
// ============================================================
add_action('woocommerce_thankyou', 'orasage_handle_payment_success', 10, 1);

function orasage_handle_payment_success($order_id) {
    // 仅当带有 custom_mode=app 标记时触发
    if (!isset($_GET['custom_mode']) || $_GET['custom_mode'] !== 'app') {
        return;
    }
    ?>
    <script>
    (function() {
        var APP_IFRAME_ID = '<?php echo esc_js(ORASAGE_APP_IFRAME_ID); ?>';
        var MODAL_ID       = '<?php echo esc_js(ORASAGE_MODAL_CONTAINER_ID); ?>';

        // 1. 向计算器发送支付成功信号
        var appFrame = document.getElementById(APP_IFRAME_ID);
        if (appFrame && appFrame.contentWindow) {
            appFrame.contentWindow.postMessage({
                action: 'WP_PAYMENT_SUCCESS',
                orderId: '<?php echo esc_js($order_id); ?>'
            }, '*');
        }

        // 2. 关闭 Modal
        var modal = document.getElementById(MODAL_ID);
        if (modal) {
            modal.style.display = 'none';
        }

        // 3. 清空结算 iframe
        var checkoutFrame = document.getElementById('orasage-checkout-iframe');
        if (checkoutFrame) {
            checkoutFrame.src = '';
        }
    })();
    </script>
    <?php
}

// ============================================================
// 3. 注册 REST API 用于接收报告推送（与计算器后端对接）
// ============================================================
add_action('rest_api_init', function () {
    register_rest_route('orasage/v1', '/save-report', [
        'methods'  => 'POST',
        'callback' => 'orasage_save_report',
        'permission_callback' => '__return_true',
    ]);
});

function orasage_save_report($request) {
    $params = $request->get_json_params();

    $email         = sanitize_email($params['email'] ?? '');
    $name          = sanitize_text_field($params['name'] ?? '');
    $planType      = sanitize_text_field($params['planType'] ?? '');
    $price         = sanitize_text_field($params['price'] ?? '');
    $reportContent = wp_kses_post($params['reportContent'] ?? '');
    $sections      = $params['sections'] ?? [];
    $createdAt     = sanitize_text_field($params['createdAt'] ?? '');

    if (empty($email) || empty($reportContent)) {
        return new WP_Error('missing_fields', 'Email and reportContent required', ['status' => 400]);
    }

    // 查找或创建用户（以邮箱为用户名）
    $user = get_user_by('email', $email);
    if (!$user) {
        $username = sanitize_user(strstr($email, '@', true), true);
        // 确保用户名唯一
        if (username_exists($username)) {
            $username = $username . '_' . wp_rand(100, 999);
        }
        $user_id = wp_create_user($username, wp_generate_password(), $email);
        if (is_wp_error($user_id)) {
            return new WP_Error('user_create_failed', 'Failed to create user', ['status' => 500]);
        }
        wp_update_user(['ID' => $user_id, 'display_name' => $name ?: $username]);
    } else {
        $user_id = $user->ID;
    }

    // 保存报告到自定义文章类型或用户 meta
    // 这里使用用户 meta 存储，你也可以扩展为自定义文章类型
    $reports = get_user_meta($user_id, 'orasage_reports', true) ?: [];
    $reports[] = [
        'order_id'      => uniqid('orasage_'),
        'plan_type'     => $planType,
        'price'         => $price,
        'report'        => $reportContent,
        'sections'      => $sections,
        'created_at'    => $createdAt ?: current_time('mysql'),
    ];
    update_user_meta($user_id, 'orasage_reports', $reports);

    // 发送邮件通知用户报告已就绪
    wp_mail(
        $email,
        '您的 OraSage 命理报告已就绪',
        "您好" . ($name ? " $name" : "") . "，\n\n" .
        "您的 {$planType} 命理报告已完成，登录后可查看。\n\n" .
        "感谢您的使用！\n" .
        home_url()
    );

    return [
        'success' => true,
        'user_id' => $user_id,
        'message' => 'Report saved successfully',
    ];
}
