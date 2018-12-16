import { Client } from 'bugsnag-react-native';
import config from '../helpers/config';

const bugsnag = new Client(config.BUGSNAG_API_KEY);

export default bugsnag;