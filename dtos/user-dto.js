class UserDto {
  constructor(model) {
    this.id = model._id;
    this.email = model.email;
    this.fullName = model.fullName;
    this.avatarUrl = model.avatarUrl;
    this.isActivated = model.isActivated;

    this.postsCount = model.postsCount;
    this.productsCount = model.productsCount;
    this.aboutMe = model.aboutMe;
    this.friends = model.friends;
    this.createdAt = model.createdAt;
  }
  id;
  email;
  fullName;
  avatarUrl;
  isActivated;
  postsCount;
  productsCount;
  aboutMe;
  friends;
  createdAt;
}

export default UserDto;
