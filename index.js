// ==========================================
// 1. Supabase 初始化
// ==========================================
const SUPABASE_URL = 'https://ocpiavpkyrpmuxnifxwk.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_VNjweuA8UvWaWxNnvK0l1Q_Dxfw-D-3'; 
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 2. 算分逻辑
// ==========================================
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

// ==========================================
// 3. 猫咪图片配置
// ==========================================
const catImages = {
    sentinel: "sentinel.webp",
    guardian: "guardian.webp",
    healer: "healer.webp",
    newbie: "newbie.webp"
};

// ==========================================
// 4. 后台统计功能（不显示在前端）
// ==========================================
async function saveToStatistics(score, level, answers) {
  try {
    const { data, error } = await supabaseClient
      .from('results')
      .insert([
        { 
          score: score, 
          level: level, 
          answers: answers,
          created_at: new Date() 
        }
      ])
      .select();
    
    if (error) {
      console.error('统计保存失败:', error);
    } else {
      console.log('统计数据保存成功:', data);
    }
  } catch (error) {
    console.error('统计功能异常:', error);
  }
}

// ==========================================
// 5. 核心逻辑：点击按钮后执行
// ==========================================
document.getElementById('submit-btn').addEventListener('click', async function() {
  let totalScore = 0;
  let userAnswers = {};
  
  // 计算总分 & 收集答案
  for (let i = 1; i <= 10; i++) {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    if (!selected) {
      alert(`请完成第 ${i} 题！`);
      return;
    }
    userAnswers[`q${i}`] = selected.value;
    totalScore += scoreMap[i - 1][selected.value];
  }
  
  totalScore = Math.round(totalScore * 2) / 2;
  
  // 确定猫咪等级
  let enKey;
  if (totalScore >= 16) enKey = "sentinel";
  else if (totalScore >= 10) enKey = "guardian";
  else if (totalScore >= 5) enKey = "healer";
  else enKey = "newbie";
  
  // ==========================================
  // 6. 保存统计数据（后台运行，用户无感知）
  // ==========================================
  await saveToStatistics(totalScore, enKey, userAnswers);
  
  // ==========================================
  // 7. 页面切换与播放声音
  // ==========================================
  document.getElementById('quiz').style.display = "none";
  document.getElementById('result').style.display = "block";
  
  const imgEl = document.getElementById('cat-image');
  imgEl.src = catImages[enKey];
  
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
