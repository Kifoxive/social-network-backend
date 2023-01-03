class AuthDto {
  constructor(model) {
    this.id = model._id;
    this.email = model.email;
    this.fullName = model.fullName;
  }
  id;
  email;
  fullName;
}

export default AuthDto;
