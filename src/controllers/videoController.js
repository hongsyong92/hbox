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
export const see = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  return res.render("watch", { pageTitle: `Watching ${video.title}` });
};
export const edit = (req, res) => res.render("edit");
export const search = (req, res) => res.send("Search Videos");
export const upload = (req, res) => res.send("upload Videos");
export const deleteVideo = (req, res) => res.send("Delete Video");
