# 进阶基于命令编程 { #complex-command-based }

当一台基础机器人能开、能跑一个简单的自动阶段（auto）之后，下一步就是真正的比赛机器人：多个机构、状态机，以及协调它们的上层结构（superstructure）。可以跟着 frcsoftware.org 学习课程的 **Stage 2** 来学。它的项目是给一台真实的 FRC 机器人编程：4322 Clockwork 队 2025 年休赛期的机器人 MIDTIDE。

[:octicons-arrow-right-24: 在 frcsoftware.org 上开始 Stage 2](https://frcsoftware.org/learning-course/stage2/stage-overview/){ .md-button .md-button--primary }

!!! warning "仍在编写中"

    Stage 2 还在编写中。目前只有它的[概览](https://frcsoftware.org/learning-course/stage2/stage-overview/)上线了。下面的各个小阶段写完后会陆续出现在 frcsoftware.org 上。

## 内容 { #what-it-covers }

Stage 2 一次一个部分地给 MIDTIDE 编程。每个小阶段都建立在上一个之上：

| 小阶段 | 你要编程的内容 |
|---|---|
| **2A** | 升降机构 |
| **2B** | 臂 |
| **2C** | 夹爪 |
| **2D** | 几个基本的手动阶段（teleop）模式 |
| **2E** | 分料机构和吸取机构，以及仿真后端，独立完成 |
| **2F** | 基于状态机的手动阶段 |
| **2G** | 上层结构中的基本防碰撞 |

在这个过程中，它还会讲怎样组织机器人代码，以及怎样自己给一个机构做仿真。它不讲舵轮、视觉或位姿估计。

## 开始之前 { #before-you-start }

Stage 2 假设你已经学完了 Stage 1：[Stage 1A](https://frcsoftware.org/learning-course/stage1/stage1a/stage-overview/)，在那里你会给一台套件机器人（kitbot）编程；以及 Stage 1B，也就是本站的[基于命令的基本结构](command-based-skeleton.md)。讲 PID 控制和日志的 [Stage 1C](https://frcsoftware.org/learning-course/stage1/stage1c/stage-overview/) 也还在编写中。

!!! tip "在真实机器人里看这些思路"

    [2910 队的代码](command-based-styles/team-2910.md)用的是和 Stage 2F、2G 相同的核心思路：每个子系统里都有一个状态机，再由一个上层结构来协调它们。

!!! info "版权说明"

    这些课程来自 [frcsoftware.org](https://frcsoftware.org/)，一个由社区维护的 FRC 软件学习课程（[GitHub](https://github.com/frcsoftware/frcsoftware.org)），以 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/) 协议共享。本站只提供链接。
