import UserDto from "./user-dto.js";

class ProductDto {
  constructor(model) {
    this.id = model._id;
    this.title = model.title;
    this.text = model.text;
    this.tags = model.tags;
    this.user = new UserDto(model.user);
    this.imageUrl = model.imageUrl;
    this.price = model.price;
    this.currency = model.currency;
    this.createdAt = model.createdAt;
  }
  id;
  title;
  text;
  tags;
  user;
  imageUrl;
  price;
  currency;
  createdAt;
}

export default ProductDto;
