// 1. 定义算分规则
const scoreMap = [
  { A: 0, B: 1, C: 0.5, D: 2 }, // Q1
  { A: 0, B: 0.5, C: 0, D: 2 }, // Q2
  { A: 0, B: 1, C: 0.5, D: 2 }, // Q3
  { A: 0.5, B: 0, C: 1, D: 2 }, // Q4
  { A: 0, B: 0.5, C: 1, D: 2 }, // Q5
  { A: 2, B: 1, C: 0.5, D: 0 }, // Q6
  { A: 0, B: 1, C: 0.5, D: 2 }, // Q7
  { A: 0.5, B: 1, C: 0, D: 2 }, // Q8
  { A: 0, B: 0.5, C: 1, D: 2 }, // Q9
  { A: 0.5, B: 1, C: 2, D: 0 }  // Q10
];

// 2. 定义猫咪图片路径
const catImages = {
    sentinel: "sentinel.webp",
    guardian: "guardian.webp",
    healer: "healer.webp",
    newbie: "newbie.webp"
};

// 3. 核心逻辑：点击按钮后执行
document.getElementById('submit-btn').addEventListener('click', function() {
  let totalScore = 0;

  // 计算总分
  for (let i = 1; i <= 10; i++) {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    if (!selected) {
      alert(`请完成第 ${i} 题！`);
      return;
    }
    totalScore += scoreMap[i - 1][selected.value];
  }
  totalScore = Math.round(totalScore * 2) / 2;

  // 确定猫咪等级
  let enKey;
  if (totalScore >= 16) enKey = "sentinel";
  else if (totalScore >= 10) enKey = "guardian";
  else if (totalScore >= 5) enKey = "healer";
  else enKey = "newbie";

  // --- 页面切换与播放声音 ---

  // 隐藏题目，显示结果
  document.getElementById('quiz').style.display = "none";
  document.getElementById('result').style.display = "block";

  // 显示猫咪图片
  const imgEl = document.getElementById('cat-image');
  imgEl.src = catImages[enKey];

  // 【关键】播放猫叫声
  var sound = document.getElementById('cat-sound');
  sound.play();

  // 保存图片功能
  document.getElementById('download-btn').onclick = function() {
    const link = document.createElement('a');
    link.download = `我的反诈人格-${enKey}.jpg`;
    link.href = imgEl.src;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
});