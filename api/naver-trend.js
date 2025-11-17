export default async function handler(req, res) {
  const { keyword } = req.query;
  if (!keyword) return res.status(400).json({ error: "Missing keyword" });

  const startDate = getDate(-7);
  const endDate = getDate(0);

  const body = {
    startDate,
    endDate,
    timeUnit: "date",
    keywordGroups: [{ groupName: keyword, keywords: [keyword] }]
  };

  const response = await fetch("https://openapi.naver.com/v1/datalab/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
      "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  const ratios = data.results[0].data.map(item => item.ratio);
  const today = ratios[ratios.length - 1];
  const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  const diff = (today - avg).toFixed(2);

  res.status(200).json({ keyword, today, average: avg.toFixed(2), diff, trend: today > avg ? "상승" : "하락" });
}

function getDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() + daysAgo);
  return d.toISOString().split("T")[0];
}
