import ProductDto from "./product-dto.js";
import UserDto from "./user-dto.js";

class PostDto {
  constructor(model) {
    this.id = model._id;
    this.title = model.title;
    this.text = model.text;
    this.tags = model.tags;
    this.viewsCount = model.viewsCount;
    this.user = new UserDto(model.user);
    this.imageUrl = model.imageUrl;
    this.createdAt = model.createdAt;
    this.selectedProducts = model.selectedProducts.map(
      (item) => new ProductDto(item)
    );
  }
  id;
  title;
  text;
  tags;
  viesCount;
  selectedProducts;
  user;
  imageUrl;
  createdAt;
}

export default PostDto;
