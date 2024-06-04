# 说明
htlc（hash Time lock Contract）是一种基于区块链技术的“智能合约”

定义：HTLC允许指定方（“卖方”）通过公开hash的原始信息来花费资金。其核心原理是使用带有哈希锁定和时间锁定机制的合约进行资产锁定，实现质押效果，为不同资产之间的交易提供信任基础。

本项目基于next.js实现了htlc的前端demo
基于solidity实现了htlc的智能合约


### 安装
1.运行yarn 安装依赖

2.运行yarn next build 构建前端项目

3.运行yarn hardhat deploy 部署智能合约

4.运行yarn run start 启动前端项目