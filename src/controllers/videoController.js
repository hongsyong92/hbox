import Video from "../models/Video";

export const home = (req, res) => {
  Video.find({}, (error, videos) => {
    return res.render("home", { pageTitle: "Home", videos });
  });
};
export const watch = (req, res) => {
  const { id } = req.params;
  return res.render("watch", {
    pageTitle: `영상 시청 중`,
  });
};
export const getEdit = (req, res) => {
  const { id } = req.params;
  return res.render("edit", {
    pageTitle: `영상 수정 중`,
  });
};
export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "업로드" });
};
export const postUpload = (req, res) => {
  const { title } = req.body;
  return res.redirect(`/`);
};

export const search = (req, res) => res.send("Search Videos");
export const deleteVideo = (req, res) => res.send("Delete Video");
