import User from "../models/User";

export const getJoin = (req, res) =>
  res.render("join", { pageTitle: "가입하기" });

export const postJoin = async (req, res) => {
  const { name, username, email, password, password2, location } = req.body;
  const pageTitle = "가입하기";

  // password 확인
  if (password !== password2) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "패스워드가 일치하지 않습니다.",
    });
  }

  // username, email 중복 식별
  const exists = await User.exists({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: "이미 사용중인 username/email 입니다.",
    });
  }

  await User.create({
    name,
    username,
    email,
    password,
    password2,
    location,
  });
  return res.redirect("/login");
};
export const edit = (req, res) => res.send("Edit User");
export const remove = (req, res) => res.send("Remove User");
export const login = (req, res) => res.send("login");
export const logout = (req, res) => res.send("logout");
export const see = (req, res) => res.send("see user");
