const db= require("./db");
const {createApp, asyncHandler, integer, subjectName, start } = require("./sample_common");
const app = createApp();

//메뉴 검색
app.get("/", asyncHandler(async (req, res)=> {
    const keyword = String(req.query.keyword ?? "").trim();
        
  const [menus] = await db.execute(
    "SELECT id, name, price, description FROM menus WHERE name LIKE ? ORDER BY id DESC",
    [`%${keyword}%`]
  );
    res.render("cafe", {menus, keyword });
}));
//메뉴 등록
app.post("/menus/post", asyncHandler(async (req, res) => {
  const menus = String(req.body.name ?? "").trim();
  const priceInput = String(req.body.price ?? "").trim();
  const price = integer(priceInput);
  const description = String(req.body.description ?? "").trim();

  if (
    !menus || [...menus].length > 100 ||
    price < 0 || price < -2147483648 || price > 2147483647) {
    return res.status(400).render("sample_error", { message: "메뉴명과 가격을 확인하세요." });
  }
  await db.execute("INSERT INTO menus (name, price,description) VALUES (?, ?, ?)", [menus, price, description]);
  res.redirect(303, "/");
}));
//메뉴 수정
app.post("/menus/edit", asyncHandler(async (req, res) => {
  const id = integer(req.body.id);
  const name = String(req.body.name);
  const price = integer(req.body.price);
  const description = String(req.body.description ?? "").trim();

  if (
    id === null || id <= 0 ||!name || [...name].length > 100 || price === null || price < -2147483648 || price > 2147483647){    
    return res.status(400).render
    ("sample_error",{ message: "입력값 또는 대상 ID를 확인하세요." });
    }
    
    const [result] = await db.execute(
        "UPDATE menus SET name = ?, price = ?, description = ? WHERE id = ?",
        [name, price, description, id]);
    
    if (result.affectedRows === 0) {
        return res.status(404).render("sample_error", {
            message: "입력값 또는 대상 ID를 확인하세요."});
    }
    res.redirect(303, "/");
}));
//메뉴 삭제
app.post("/menus/delete",asyncHandler(async(req,res)=> {
    const id = integer(req.body.id);
    if (id === null || id <= 0) {
        return res.status(400).render("sample_error",
            { message: "입력값 또는 대상 ID를 확인하세요."});
    }
    const [result] = await db.execute("DELETE FROM menus WHERE id = ?", [id]);
    if (result.affectedRows === 0)return res.status(404).render("sample_error", {message: "입력값 또는 대상 ID를 확인하세요." });
    res.redirect(303, "/");
}));

start (app, " ")