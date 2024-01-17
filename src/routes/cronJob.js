import express from 'express';
import authenticate from '../middlewares/authenticate.js';
import { getSettings, setSettings } from '../controllers/cronJob/cronJob.js';
import { deleteAllTables, startSync } from '../controllers/cronJob/cabinets.js';
import { getTMCabinet } from '../services/teammate/cabinets.js';
import { getOSXData } from '../controllers/cronJob/osx.js';

const router = express.Router();

router.get('/settings', authenticate, getSettings);

/**
 * @openapi
 * /sync/osx-data:
 *   get:
 *     description: Get One-SumX structured data!
 */
router.get('/osx-data', getOSXData);

router.post('/settings', authenticate, setSettings);
/**
 * @openapi
 * /sync/run:
 *   get:
 *     description: Runs the syncronization process!
 *     responses:
 *       200:
 *         description: Syncronization process is started.
 *       400:
 *         description: Syncronization process failed and stopped.
 */
router.post('/run',authenticate, startSync);
/**
 * @openapi
 * /sync/tables/rows:
 *   delete:
 *     description: Clear all tables' rows except the users!
 *     responses:
 *       200:
 *         description: Tables' rows were cleared.
 *       400:
 *         description: Tables' rows failed to be cleared.
 */
router.delete('/tables/rows', deleteAllTables);

/**
 * @openapi
 * /sync/cabinets/{cabinetId}:
 *   get:
 *     description: Get generated teammate cabinet by id
 *     parameters:
 *      - name: cabinetId
 *        in: path
 *        description: The id of the cabinet
 *        required: true
 *     responses:
 *       200:
 *         description: Fetched successfully.
 *       400:
 *         description: Failed to be fetched.
 */
router.get('/cabinets/:id', async (req, res) => {
  console.log(req.params);
  const { id } = req.params;
  try {
    const cabinet = await getTMCabinet(id).then(res => res.data);
    res.json({ message: 'Hello', cabinet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
