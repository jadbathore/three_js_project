import express from 'express';
export const optionTest = {
    dotfiles: 'ignore',
    etag: true,
    extensions: ['htm', 'html'],
    index: false,
    redirect: false,
    maxAge: '1d',
    setHeader: (res, path, stat) => {
        res.header('Cache-Control', [(express.static.mime.lookup(path) === 'application/javascript') ? 'no-store' : 'public']);
        console.log(typeof stat);
    }
};
