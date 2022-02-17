const videos = [
  {
    title: "First Video",
    rating: 5,
    comments: 2,
    createdAt: "2분 전",
    views: 55,
    id: 1,
  },
  {
    title: "Second Video",
    rating: 4,
    comments: 1,
    createdAt: "22분 전",
    views: 55,
    id: 2,
  },
  {
    title: "Third Video",
    rating: 3,
    comments: 0,
    createdAt: "12분 전",
    views: 55,
    id: 3,
  },
];

export const trending = (req, res) => {
  return res.render("home", { pageTitle: "Home", videos });
};
export const watch = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  return res.render("watch", {
    pageTitle: `${video.title} 영상 시청 중`,
    video,
  });
};
export const getEdit = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  return res.render("edit", {
    pageTitle: `${video.title} 영상을 수정 중`,
    video,
  });
};
export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  videos[id - 1].title = title;
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "업로드" });
};
export const postUpload = (req, res) => {
  const { title } = req.body;
  const newVideo = {
    title,
    rating: 0,
    comments: 0,
    createdAt: "지금",
    views: 0,
    id: videos.length + 1,
  };
  videos.push(newVideo);
  return res.redirect(`/`);
};

export const search = (req, res) => res.send("Search Videos");
export const deleteVideo = (req, res) => res.send("Delete Video");
