import { getTensorWhitelistProgram } from './generated';

export const tensorWhitelist = () => ({
  install() {
    getTensorWhitelistProgram();
  },
});
