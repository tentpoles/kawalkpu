/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
import { Fragment } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

const columns = [
  { field: 'id', headerName: '#', width: 60 },
  { field: '01', headerName: 'Paslon 1', minWidth: 150 },
  { field: '02', headerName: 'Paslon 2', minWidth: 150 },
  { field: '03', headerName: 'Paslon 3', minWidth: 150 },
  { field: 'total_suara_masuk', headerName: 'Total Suara Ketiga Paslon', minWidth: 250 },
  { field: 'suara_sah', headerName: 'Suara Sah', minWidth: 150 },
  {
    field: 'url',
    headerName: '',
    minWidth: 200,
    renderCell: (params) => {
      const url = params.value.replace('https://sirekap-obj-data.kpu.go.id/pemilu/hhcw/ppwp/', 'https://pemilu2024.kpu.go.id/pilpres/hitung-suara/');
      return (
        <a href={url} target="_blank">{url}</a>
      )
    },
  },
];

export default function DataTable({ state, fetchQueueTps, requestLimit }) {
  const disabled = !state.queue.tps.length || state.loading;
  const tpsLeft = state.count.tps - (state.count.tps - state.queue.tps.length);
  return (
    <Fragment>
      <div>
        <Typography variant="h4" uppercase>
          Daftar TPS Dengan Suara Sumbang (Anomali).
        </Typography>
      </div>
      <div style={{ height: 440, width: '100%', marginTop: '18px' }}>
        <DataGrid
          rows={state.dirtyVotes}
          columns={columns}
          loading={state.loading}
          classes={{
            root: 'data-grid',
          }}initialState={{
            pagination: {
              paginationModel: {
                pageSize: 100,
              },
            },
          }}
          pageSizeOptions={[100]}
        />
      </div>
      {
        ((state.dirtyVotes.length > 0) && (!state.queue.kelurahan.length)) ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              marginTop: '24px',
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                if (tpsLeft > 0) {
                  fetchQueueTps();
                }
              }}
              disabled={disabled}
            >
              {`PROSES ${tpsLeft < requestLimit ? tpsLeft : requestLimit} TPS LAGI`}
            </Button>
            <span style={{ margin: '12px 0' }}>{`Tersisa ${tpsLeft} TPS.`}</span>
          </div>
        ) : null
      }
      <style jsx>
        {`
          .data-grid .MuiDataGrid-cell, .data-grid .MuiDataGrid-columnHeaderTitle {
            text-overflow: clip;
          }
        `}
      </style>
    </Fragment>
  );
}