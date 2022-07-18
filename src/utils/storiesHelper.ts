export const filterStories = (users: any) => {
  const filteredUsers = users.map((user: any) => ({
    ...user,
    stories: user.stories.filter(
      (story: any) =>
        new Date().getTime() - story.createdAt.getTime() < 86400000
    ),
  }));

  const againFilteredUsers = filteredUsers.filter(
    (user: any) => user.stories.length > 0
  );

  return againFilteredUsers;
};

export const filterStoriesOfCurrentUser = (stories: any) => {
  return stories.filter(
    (story: any) => new Date().getTime() - story.createdAt.getTime() < 86400000
  );
};
