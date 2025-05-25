import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import TicketModel, { ticketDAO, TypeTicket } from "../models/ticket.model";
import { FilterQuery, isValidObjectId } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      await ticketDAO.validate(req.body);
      const result = await TicketModel.create(req.body);
      response.success(res, result, "Success to Create Ticket");
    } catch (error) {
      response.error(res, error, "Failed to create ticket");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    try {
      const {
        limit = 10,
        page = 1,
        search,
      } = req.query as unknown as IPaginationQuery;

      const query: FilterQuery<TypeTicket> = {};

      if (search) {
        Object.assign(query, {
          ...query,
          $text: {
            $search: search,
          },
        });
      }

      const result = await TicketModel.find(query)
        .populate("events")
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();
      const count = await TicketModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          total: count,
          current: page,
          totalPages: Math.ceil(count / limit),
        },
        "success find all tickets"
      );
    } catch (error) {
      response.error(res, error, "Failed to findAll ticket");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await TicketModel.findById(id);
      response.success(res, result, "Success findOne ticket");
    } catch (error) {
      response.error(res, error, "Failed to findOne ticket");
    }
  },
  async update(req: IReqUser, res: Response) {
    const { id } = req.params;
    const result = await TicketModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    response.success(res, result, "Success update ticket");
    try {
    } catch (error) {
      response.error(res, error, "Failed to update ticket");
    }
  },
  async remove(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await TicketModel.findByIdAndDelete(id, {
        new: true,
      });
      response.success(res, result, "Success remove ticket");
    } catch (error) {
      response.error(res, error, "Failed to remove ticket");
    }
  },
  async findAllByEvent(req: IReqUser, res: Response) {
    try {
      const { eventId } = req.params;

      if (!isValidObjectId(eventId)) {
        return response.error(res, null, "Ticket not found");
      }

      const result = await TicketModel.find({ events: eventId }).exec();

      response.success(res, result, "Success findAllByEvent");
    } catch (error) {
      response.error(res, error, "Failed to findAllByEvent ticket");
    }
  },
};
