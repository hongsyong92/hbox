import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) =>
  res.render("join", { pageTitle: "가입하기" });

// 회원가입 로직
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
  try {
    await User.create({
      name,
      username,
      email,
      password,
      password2,
      location,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.status(400).render("join", {
      pageTitle,
      errorMessage: error._message,
    });
  }
};

export const getLogin = (req, res) =>
  res.render("login", { pageTitle: "로그인" });

// 로그인 로직
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "로그인";
  const user = await User.findOne({ username, socialOnly: false });

  // 계정 존재 유무 체크
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "존재하지 않는 아이디입니다.",
    });
  }

  // 비밀번호 맞는지 체크
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "비밀번호가 일치하지 않습니다.",
    });
  }
  // 둘다 체크 완료 후 로그인 되면 아래 두 줄이 세션 정보를 넣어주는 것
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};

export const startGithubLogin = (req, res) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email",
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  return res.redirect(finalUrl);
};

export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    // api 접근
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";

    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailData = await (
      await fetch(`${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();

    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }

    let user = await User.findOne({ email: emailObj.email });
    if (!user) {
      // 만약 깃헙계정 없을 시 깃헙이메일로 계정 생성
      user = await User.create({
        avatarUrl: userData.avatar_url,
        name: userData.name,
        username: userData.login,
        email: emailObj.email,
        password: "",
        socialOnly: true,
        location: userData.location,
      });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    return res.redirect("/");
  } else {
    return res.redirect("/login");
  }
};

export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};

export const getEdit = (req, res) => {
  return res.render("edit-profile", { pageTitle: "프로필 수정" });
};
export const postEdit = async (req, res) => {
  const {
    _id,
    avatarUrl,
    email: sessionEmail,
    username: sessionUsername,
  } = req.session.user;
  const { name, email, username, location } = req.body;
  const { file } = req;

  let duplicateUserParams = [];
  if (sessionEmail !== email) {
    duplicateUserParams.push({ email });
  }
  if (sessionUsername !== username) {
    duplicateUserParams.push({ username });
  }
  if (duplicateUserParams.length > 0) {
    const duplicateUser = await User.findOne({
      $or: duplicateUserParams,
    });
    if (duplicateUser && duplicateUser._id.toString() !== _id) {
      return res.status(400).render("edit-profile", {
        pageTitle: "프로필 수정",
        errorMessage: "이미 존재하는 아이디/이메일 입니다.",
      });
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      username,
      location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/users/edit");
  // 만약 user가 값 변경없이 업데이트 버튼을 누르거나 다른 유저와 같은 정보로 변경하려고 할 때의 케이스 처리 추가해야함
};

export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "비밀번호 변경" });
};
export const postChangePassword = async (req, res) => {
  const { _id, password } = req.session.user;
  const { oldPassword, newPassword, newPasswordConfirmation } = req.body;

  const ok = await bcrypt.compare(oldPassword, password);

  if (!ok) {
    return res.status(400).render("users/change-password", {
      pageTitle: "비밀번호 변경",
      errorMessage: "기존 비밀번호가 일치하지 않습니다.",
    });
  }
  if (newPassword !== newPasswordConfirmation) {
    return res.status(400).render("users/change-password", {
      pageTitle: "비밀번호 변경",
      errorMessage: "새로운 비밀번호가 일치하지 않습니다.",
    });
  }
  const user = await User.findById(_id);
  user.password = newPassword;
  await user.save();
  req.session.user.password = user.password;
  return res.redirect("/users/logout");
};

export const see = (req, res) => res.send("see user");
