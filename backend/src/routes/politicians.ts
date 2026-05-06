import { MOCK_SEARCH_POLITICIANS } from '../services/mockData';
import { createEntityRouter } from './entityRoutes';

export const politiciansRouter = createEntityRouter('politician', MOCK_SEARCH_POLITICIANS);
