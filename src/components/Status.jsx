/* eslint-disable react/prop-types */
import { Fragment, useState, useMemo } from 'react';
import { Info, XCircle } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

function Status({ state }) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const currentStatus = useMemo(() => {
        if (state.error) return 'error';
        if (state.loading || state.queue.kelurahan.length > 0) return 'networkRequest';
        return 'idle';
    }, [state]);

    const status = {
        idle: {
            message: 'sedang tidak terdapat aktivitas.',
            color: '#3B82F6',
        },
        networkRequest: {
            message: (!state.queue.tps.length || state.queue.kelurahan.length > 0) ? `sedang memproses data ${state.count.kelurahan ? state.count.kelurahan : ''} kelurahan.` : 'sedang memproses data tps.',
            color: '#22C55E',
        },
        error: {
            message: 'terjadi kesalahan.',
            color: '#EF4444',
        },
    }
    return (
        <Fragment>
            <Dialog
                onClose={handleClose}
                aria-labelledby="customized-dialog-title"
                open={open}
            >
                <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                    Informasi status sistem
                </DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 12,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <XCircle />
                </IconButton>
                <DialogContent dividers>
                    <ol>
                        <li>
                            <Typography gutterBottom>
                                Sedang idle: tidak terdapat aktivitas pada jaringan browser.
                            </Typography>
                        </li>
                        <li>
                            <Typography gutterBottom>
                                Sedang mengambil data: terdapat proses pengambilan data (network request) yang mengarah ke api https://sirekap-obj-data.kpu.go.id.
                            </Typography>
                        </li>
                        <li>
                            <Typography gutterBottom>
                                Terjadi kesalahan: terdapat suatu error yang bisa saja disebabkan oleh  device yang digunakan tidak mampu berjalan optimal karena pada sistem ini melakukan network request hingga 500 request++ (ugal-ugalan) dalam satu waktu secara terus menerus, atau bisa juga disebabkan karena jaringan internet yang kurang stabil. Lakukan full page refresh untuk menjalankan sistem dari awal.
                            </Typography>
                        </li>
                    </ol>
                </DialogContent>
            </Dialog>
            <div
                style={{
                    width: '100%',
                    padding: '12px',
                    position: 'fixed',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: '0',
                    background: status[currentStatus].color,
                    zIndex: '999',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        color: '#fff',
                    }}
                >
                    <span>{`Status sistem: ${status[currentStatus].message}`}&nbsp;</span>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            color: '#fff',
                            cursor: 'pointer',
                        }}
                        onClick={() => handleClickOpen()}
                    >
                        <Info size="16" />
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default Status;