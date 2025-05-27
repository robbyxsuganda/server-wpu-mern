import mongoose, { ObjectId, Schema } from "mongoose";
import * as Yup from "yup";
import { EVENT_MODEL_NAME } from "./event.model";
import { USER_MODEL_NAME } from "./user.model";
import { TICKET_MODEL_NAME } from "./ticket.model";
import { getId } from "../utils/id";
import payment, { TypeResponseMidtrans } from "../utils/payment";

export const ORDER_MODEL_NAME = "Order";

export const orderDTO = Yup.object({
  createdBy: Yup.string().required(),
  events: Yup.string().required(),
  ticket: Yup.string().required(),
  quantity: Yup.number().required(),
});

export type TypeOrder = Yup.InferType<typeof orderDTO>;

export enum OrderStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export type TypeVoucher = {
  voucherId: string;
  isPrint: boolean;
};

export interface Order
  extends Omit<TypeOrder, "createdBy" | "events" | "ticket"> {
  total: number;
  status: string;
  payment: TypeResponseMidtrans;
  createdBy: ObjectId;
  events: ObjectId;
  orderId: string;
  ticket: ObjectId;
  quantity: number;
  vouchers: TypeVoucher[];
}

const OrderSchema = new Schema<Order>(
  {
    orderId: {
      type: Schema.Types.String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: true,
    },
    events: {
      type: Schema.Types.ObjectId,
      ref: EVENT_MODEL_NAME,
      required: true,
    },
    total: {
      type: Schema.Types.Number,
      required: true,
    },
    payment: {
      type: {
        token: {
          type: Schema.Types.String,
          required: true,
        },
        redirect_url: {
          type: Schema.Types.String,
          required: true,
        },
      },
    },
    status: {
      type: Schema.Types.String,
      enum: [OrderStatus.PENDING, OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      default: OrderStatus.PENDING,
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: TICKET_MODEL_NAME,
      required: true,
    },
    quantity: {
      type: Schema.Types.Number,
      required: true,
    },
    vouchers: {
      type: [
        {
          voucherId: {
            type: Schema.Types.String,
          },
          isPrint: {
            type: Schema.Types.Boolean,
            default: false,
          },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
).index({ orderId: "text" });

OrderSchema.pre("save", async function () {
  const order = this;
  order.orderId = getId();
  order.payment = await payment.createLink({
    transaction_details: {
      gross_amount: order.total,
      order_id: order.orderId,
    },
  });
});

const OrderModel = mongoose.model(ORDER_MODEL_NAME, OrderSchema);
export default OrderModel;
