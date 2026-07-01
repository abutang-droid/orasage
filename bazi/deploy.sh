#!/bin/bash
# OraSage 计算器一键部署脚本
# 用法：./deploy.sh
# 完成后将生成 orasage-calculator-dist.tar.gz 和 orasage-payment.zip

set -e
echo "=== OraSage 打包工具 ==="
echo ""

# 1. 构建前端 + 后端
echo "📦 构建计算器..."
pnpm run build
# 确保 reports 目录存在（即使构建前为空，运行时动态创建）
mkdir -p dist/public/reports 2>/dev/null || true

# 2. 打包计算器
echo "📦 打包计算器..."
rm -f orasage-calculator-dist.tar.gz
tar czf orasage-calculator-dist.tar.gz -C dist .
echo "   ✅ orasage-calculator-dist.tar.gz ($(du -h orasage-calculator-dist.tar.gz | cut -f1))"

# 3. 打包 WordPress 插件
echo "📦 打包 WordPress 插件..."
rm -f orasage-payment.zip
cp references/orasage-payment/orasage-payment.php /tmp/orasage-payment.php
zip -jq orasage-payment.zip /tmp/orasage-payment.php
echo "   ✅ orasage-payment.zip ($(du -h orasage-payment.zip | cut -f1))"

echo ""
echo "=== 完成 ==="
echo "部署步骤："
echo "  1. 上传 orasage-calculator-dist.tar.gz 到服务器 → 解压 → 重启容器"
echo "  2. 上传 orasage-payment.zip 到 WordPress → 插件 → 上传插件 → 启用"
