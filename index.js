// ==========================================
// 1. Supabase 初始化 (修复变量名冲突)
// ==========================================
// 注意：这里变量名改为 supabaseClient，避免和 CDN 全局变量 'supabase' 冲突
const SUPABASE_URL = 'https://ocpiavpkyrpmuxnifxwk.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_VNjweuA8UvWaWxNnvK0l1Q_Dxfw-D-3'; 
// 使用 supabase.createClient 初始化
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================================
// 2. 算分逻辑 (保持原样)
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
// 3. 猫咪图片配置 (保持原样)
// ==========================================
const catImages = {
    sentinel: "sentinel.webp",
    guardian: "guardian.webp",
    healer: "healer.webp",
    newbie: "newbie.webp"
};

// 获取统计信息的函数
async function fetchStatistics() {
  try {
    // 获取总提交次数
    const { count: totalCount, error: countError } = await supabaseClient
      .from('results')
      .select('*', { count: 'exact', head: true });
    
    if (countError) throw countError;
    
    // 获取各人格类型的统计
    const { data: statsData, error: statsError } = await supabaseClient
      .from('results')
      .select('level');
      
    if (statsError) throw statsError;
    
    // 统计各人格数量
    const levelCounts = statsData.reduce((acc, item) => {
      acc[item.level] = (acc[item.level] || 0) + 1;
      return acc;
    }, {});
    
    // 更新统计显示
    updateStatsDisplay(totalCount, levelCounts);
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
}

// 更新统计显示的函数
function updateStatsDisplay(totalCount, levelCounts) {
  const statsContainer = document.getElementById('stats-container');
  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="statistics-panel">
        <h3>📊 测试统计</h3>
        <p><strong>总参与人数：</strong>${totalCount}</p>
        <p><strong>哨兵人格 (Sentinel)：</strong>${levelCounts.sentinel || 0}人</p>
        <p><strong>守护者人格 (Guardian)：</strong>${levelCounts.guardian || 0}人</p>
        <p><strong>治愈师人格 (Healer)：</strong>${levelCounts.healer || 0}人</p>
        <p><strong>新手人格 (Newbie)：</strong>${levelCounts.newbie || 0}人</p>
      </div>
    `;
  }
}

// 页面加载完成后获取统计信息
document.addEventListener('DOMContentLoaded', function() {
  fetchStatistics();
  
  // 设置定时刷新，每分钟更新一次统计数据
  setInterval(fetchStatistics, 60000);
});

// ==========================================
// 4. 核心逻辑：点击按钮后执行
// ==========================================
document.getElementById('submit-btn').addEventListener('click', async function() {
  let totalScore = 0;
  let userAnswers = {}; // 用于存储用户的答案
  // 计算总分 & 收集答案
  for (let i = 1; i <= 10; i++) {
    const selected = document.querySelector(`input[name="q${i}"]:checked`);
    if (!selected) {
      alert(`请完成第 ${i} 题！`);
      return;
    }
    // 记录答案
    userAnswers[`q${i}`] = selected.value;
    // 计算分数
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
  // 5. 数据上传到 Supabase (新增部分)
  // ==========================================
  const { data, error } = await supabaseClient
    .from('results') // 确保你的数据库表名叫 results
    .insert([
      { 
        score: totalScore, 
        level: enKey, 
        answers: userAnswers, // 存为 JSON 格式
        created_at: new Date() 
      }
    ])
    .select();
  if (error) {
    console.error('上传失败:', error);
    // 即使上传失败，也不影响用户看结果，所以这里只打印错误，不弹窗
  } else {
    console.log('数据上传成功:', data);
    // 上传成功后刷新统计
    setTimeout(fetchStatistics, 1000); // 延迟一秒再刷新统计，确保数据同步
  }
  // ==========================================
  // 6. 页面切换与播放声音 (保持原样)
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
