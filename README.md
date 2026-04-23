# tt-lanbow-claw-skill

# tiktok-ads CLI

一个可执行的 TikTok Marketing API CLI skeleton，风格上对齐 lanbow-ads 的使用方式，但当前阶段是“可运行骨架 + 通用透传 payload”，并补上了一批常用增强能力。

已实现：
- auth status
- campaigns list/create/update
- adgroups list/create/update
- ads list/create/update
- reports get
- media upload-image / upload-video（命令与 multipart client plumbing 已就位）
- 常用 list/create/report 参数归一化
- table 输出模式

设计特点：
- 自动从环境变量读取 TIKTOK_ACCESS_TOKEN / TIKTOK_ADVERTISER_ID
- 使用 TikTok 官方 Marketing API 域名
- 保留 `--payload` / `--query` 透传字段，便于先跑通真实接口
- 为常见命令补充快捷 flags、基础校验、分页参数与友好表格输出

## Usage

```bash
cd /Users/linguang/agent/tiktok_ad_skill/tiktok-ads-cli
node ./bin/tiktok-ads.js help

export TIKTOK_ACCESS_TOKEN='***'
export TIKTOK_ADVERTISER_ID='your-advertiser-id'

node ./bin/tiktok-ads.js auth status
node ./bin/tiktok-ads.js campaigns list --page 1 --page-size 20 --status ENABLE --format table
node ./bin/tiktok-ads.js campaigns create --name 'Test Campaign' --objective TRAFFIC --budget-mode BUDGET_MODE_TOTAL --budget 100
node ./bin/tiktok-ads.js campaigns create --payload '{"campaign_name":"Payload Campaign"}'
node ./bin/tiktok-ads.js reports get --service-type AUCTION --report-type BASIC --data-level AUCTION_AD --dimensions stat_time_day,ad_id --metrics spend,impressions,clicks
node ./bin/tiktok-ads.js media upload-image --file ./demo.png
node ./bin/tiktok-ads.js media upload-video --file ./demo.mp4
```

## Notes

- 当前 `campaigns list/create` 与 `reports get` 的常用 flags 已在本地先做 normalization，便于后续接上真实 API 调用。
- `media upload-image` / `media upload-video` 已具备 multipart 请求构造能力；下一步只需要把 command 层从“本地预览请求”切到真实 client 调用，并补 integration test。
- `--format table` 会把数组结果渲染为简单终端表格。

## Next recommended steps

1. 把已归一化的 campaigns/reports/media 命令切到真实 TikTok API 调用，并保留 dry-run/debug 入口
2. 为 adgroups / ads 增加同等级的快捷 flags 和校验
3. 给 table 输出增加列选择、嵌套字段展开、分页元信息展示
4. Add integration tests against a real sandbox or user credentials
