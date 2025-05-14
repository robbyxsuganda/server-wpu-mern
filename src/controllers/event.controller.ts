import { Response } from "express";
import { IPaginationQuery, IReqUser } from "../utils/interfaces";
import response from "../utils/response";
import EventModel, { eventDAO, TEvent } from "../models/event.model";
import { FilterQuery } from "mongoose";

export default {
  async create(req: IReqUser, res: Response) {
    try {
      const payload = { ...req.body, createdBy: req.user?.id } as TEvent;
      await eventDAO.validate(payload);
      const result = await EventModel.create(payload);
      response.success(res, result, "Success Create Event");
    } catch (error) {
      response.error(res, error, "Failed Create Event");
    }
  },
  async findAll(req: IReqUser, res: Response) {
    const {
      limit = 10,
      page = 1,
      search,
    } = req.query as unknown as IPaginationQuery;
    try {
      const query: FilterQuery<TEvent> = {};

      if (search) {
        Object.assign(query, {
          ...query,
          $text: {
            $search: search,
          },
        });
      }

      const result = await EventModel.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec();

      const count = await EventModel.countDocuments(query);

      response.pagination(
        res,
        result,
        {
          total: count,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
        },
        "Success FindAll Events"
      );
    } catch (error) {
      response.error(res, error, "Failed FindAll Event");
    }
  },
  async findOne(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await EventModel.findById(id);
      response.success(res, result, "Success FindOne Event");
    } catch (error) {
      response.error(res, error, "Failed FindOne Event");
    }
  },
  async update(req: IReqUser, res: Response) {
    try {
      const { id } = req.params;
      const result = await EventModel.findByIdAndUpdate(id, req.body, {
        new: true,
      });
      response.success(res, result, "Success Update Event");
    } catch (error) {
      response.error(res, error, "Failed Update Event");
    }
  },
  async remove(req: IReqUser, res: Response) {
    const { id } = req.params;
    const result = await EventModel.findByIdAndDelete(id, {
      new: true,
    });
    response.success(res, result, "Success Remove Event");
    try {
    } catch (error) {
      response.error(res, error, "Failed Remove Event");
    }
  },
  async findOneBySlug(req: IReqUser, res: Response) {
    const { slug } = req.params;
    const result = await EventModel.findOne({ slug });
    response.success(res, result, "Success FindOneBySlug Event");
    try {
    } catch (error) {
      response.error(res, error, "Failed FindOneBySlug Event");
    }
  },
};
