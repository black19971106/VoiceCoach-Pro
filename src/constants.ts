export const ENCOURAGEMENT_PHRASES = [
  "加油！",
  "坚持住！",
  "保持呼吸节律！",
  "控制好动作节奏！",
  "不要放弃！",
  "做得很棒！",
  "最后冲刺！"
];

export const DEFAULT_PLAN: any = {
  planName: "我的训练计划",
  theme: "dark",
  phases: [
    {
      id: "p1",
      phaseName: "热身",
      items: [
        { id: "i1", name: "开合跳", duration: 30, type: "work" },
        { id: "i2", name: "休息", duration: 10, type: "rest" }
      ],
      loop: 1
    },
    {
      id: "p2",
      phaseName: "正式组",
      items: [
        { id: "i3", name: "深蹲", duration: 40, type: "work" },
        { id: "i4", name: "休息", duration: 20, type: "rest" }
      ],
      loop: 4
    }
  ]
};
