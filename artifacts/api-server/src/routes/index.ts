import { Router, type IRouter } from "express";
import healthRouter from "./health";
import leaderboardRouter from "./leaderboard";
import nftsRouter from "./nfts";
import auditsRouter from "./audits";

const router: IRouter = Router();

router.use(healthRouter);
router.use(leaderboardRouter);
router.use(nftsRouter);
router.use(auditsRouter);

export default router;
