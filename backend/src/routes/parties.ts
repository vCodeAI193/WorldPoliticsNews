import { MOCK_SEARCH_PARTIES } from '../services/mockData';
import { createEntityRouter } from './entityRoutes';

export const partiesRouter = createEntityRouter('party', MOCK_SEARCH_PARTIES);
