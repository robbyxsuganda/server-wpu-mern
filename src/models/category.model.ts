import mongose from "mongoose";

import * as Yup from "yup";

const Schema = mongose.Schema;

export const categoryDAO = Yup.object({
  name: Yup.string().required(),
  description: Yup.string().required(),
  icon: Yup.string().required(),
});

export type Category = Yup.InferType<typeof categoryDAO>;

const CategorySchema = new Schema<Category>(
  {
    name: {
      type: Schema.Types.String,
      required: true,
    },
    description: {
      type: Schema.Types.String,
      required: true,
    },
    icon: {
      type: Schema.Types.String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CategoryModel = mongose.model("Category", CategorySchema);

export default CategoryModel;
