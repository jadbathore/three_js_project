import express from 'express';
import threeTreeConfig from '../../threeTree.config.js';
const optionServer = {
    dotfiles: 'ignore',
    etag: true,
    index: false,
    redirect: true,
    maxAge: '1d',
};
export { optionServer };
