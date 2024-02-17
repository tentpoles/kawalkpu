/* eslint-disable react-hooks/exhaustive-deps */
import ComboBox from "./components/Input";
import Status from "./components/Status";
import DataTable from "./components/Table";
import Alert from '@mui/material/Alert';
import { useState, useEffect } from "react";

const requestLimit = 500;

export default function App() {
  const numberOnly = new RegExp(/^\d+$/);
  const [state, setState] = useState({
    loading: true,
    error: false,
    provinceList: [],
    selectedProvince: null,
    dirtyVotes: [],
    queue: {
      kelurahan: [],
      tps: [],
    },
    count: {
      kelurahan: 0,
      tps: 0,
    },
  });

  async function fetchProvince() {
    try {
      const res = await fetch('https://sirekap-obj-data.kpu.go.id/wilayah/pemilu/ppwp/0.json');
      const data = await res.json();
      setState((prevState) => {
        return {
          ...prevState,
          provinceList: data,
        }
      });
    } catch(e) {
      console.log(e);
    } finally {
      setState((prevState) => {
        return {
          ...prevState,
          loading: false,
        }
      });
    }
  }

  async function initData() {
    setState((prevState) => {
      return {
        ...prevState,
        loading: true,
        dirtyVotes: [],
        queue: {
          kelurahan: [],
          tps: [],
        },
        count: {
          kelurahan: 0,
          tps: 0,
        },
      }
    });
  
    try {
      const apiUrl = `https://sirekap-obj-data.kpu.go.id/pemilu/hhcw/ppwp/${state.selectedProvince}`;
      const res = await fetch(`${apiUrl}.json`);
      const data = await res.json();
      const kabupatenPromiseList = [];
      Object.keys(data?.table)?.forEach(async (kabupatenId) => {
        if (numberOnly.test(kabupatenId)) {
          const kabupatenPromise = fetch(`${apiUrl}/${kabupatenId}.json`)
            .then(async (resKabupaten) => {
              const resultKabupaten = await resKabupaten.json();
              return {
                ...resultKabupaten,
                url: `${apiUrl}/${kabupatenId}`,
              }
            });
          kabupatenPromiseList.push(kabupatenPromise);
        }
      });
      Promise.all(kabupatenPromiseList)
        .then((resKabupaten) => {
          const kecamatanPromiseList = [];
          resKabupaten.forEach((kabupaten) => {
            Object.keys(kabupaten?.table)?.forEach(async (kecamatanId) => {
              if (numberOnly.test(kecamatanId)) {
                const kecamatanPromise = fetch(`${kabupaten.url}/${kecamatanId}.json`)
                  .then(async (resKecamatan) => {
                    const resultKecamatan = await resKecamatan.json();
                    return {
                      ...resultKecamatan,
                      url: `${kabupaten.url}/${kecamatanId}`,
                    }
                  });
                kecamatanPromiseList.push(kecamatanPromise);
              }
            });
          })
          Promise.all(kecamatanPromiseList)
            .then((resKecamatan) => {
              const kelurahanList = [];
              resKecamatan.forEach((kecamatan) => {
                Object.keys(kecamatan?.table)?.forEach(async (kelurahanId) => {
                  if (numberOnly.test(kelurahanId)) {
                    kelurahanList.push({
                      url: `${kecamatan.url}/${kelurahanId}`,
                    });
                  }
                });
              })
              setState((prevState) => {
                return {
                  ...prevState,
                  loading: false,
                  queue: {
                    ...prevState.queue,
                    kelurahan: kelurahanList,
                  },
                  count: {
                    ...prevState.count,
                    kelurahan: prevState.count.kelurahan + kelurahanList.length
                  },
                }
              });
            })
        })
    } catch(e) {
      setState((prevState) => {
        return {
          ...prevState,
          loading: false,
          error: true,
        }
      });
    }
  }

  async function fetchQueueKelurahan() {
    setState((prevState) => {
      return {
        ...prevState,
        loading: true,
      }
    });
    try {
      const incomingQueue = state.queue.kelurahan.slice(0, requestLimit);
      const queuePromiseList = [];
      incomingQueue.forEach((queue) => {
        const queuePromise = fetch(`${queue.url}.json`)
          .then(async (resQueue) => {
            const resultQueue = await resQueue.json();
            return {
              ...resultQueue,
              url: queue.url,
            };
          });
        queuePromiseList.push(queuePromise);
      });
      Promise.all(queuePromiseList)
        .then((resKelurahan) => {
          const tpsList = [];
          resKelurahan.forEach((kelurahan) => {
            Object.keys(kelurahan?.table)?.forEach(async (tpsId) => {
              if (numberOnly.test(tpsId)) {
                tpsList.push({
                  url: `${kelurahan.url}/${tpsId}`,
                })
              }
            });
          })
          setState((prevState) => {
            return {
              ...prevState,
              loading: false,
              queue: {
                kelurahan: state.queue.kelurahan.slice(requestLimit),
                tps: [...prevState.queue.tps, ...tpsList],
              },
              count: {
                ...prevState.count,
                tps: prevState.count.tps + tpsList.length,
              },
            }
          });
        })
    } catch(e) {
      setState((prevState) => {
        return {
          ...prevState,
          loading: false,
          error: true,
        }
      });
      console.log(e);
    }
  }

  async function fetchQueueTps() {
    setState((prevState) => {
      return {
        ...prevState,
        loading: true,
      }
    });
    try {
      const incomingQueue = state.queue.tps.slice(0, requestLimit);
      const queuePromiseList = [];
      incomingQueue.forEach((queue) => {
        const queuePromise = fetch(`${queue.url}.json`)
          .then(async (resQueue) => {
            const resultQueue = await resQueue.json();
            return {
              ...resultQueue,
              url: queue.url,
            };
          });
          queuePromiseList.push(queuePromise);
      });
      Promise.all(queuePromiseList)
        .then((resQueue) => {
          let lastId = state.dirtyVotes.length;
          const tmpDirtyVotes = [];
          resQueue.forEach((queue) => {
            if (queue?.administrasi?.suara_sah && queue?.chart) {
              const totalSuaraMasuk = Object.values(queue.chart).reduce((acc, curr) => {
                return acc + curr;
              }, 0);
              if (totalSuaraMasuk !== queue.administrasi.suara_sah) {
                lastId += 1;
                tmpDirtyVotes.push({
                  ...queue,
                  ['01']: queue.chart['100025'],
                  ['02']: queue.chart['100026'],
                  ['03']: queue.chart['100027'],
                  total_suara_masuk: totalSuaraMasuk,
                  suara_sah: queue.administrasi.suara_sah,
                  id: lastId,
                });
              }
            }
          })
          setState((prevState) => {
            return {
              ...prevState,
              loading: false,
              dirtyVotes: [...prevState.dirtyVotes, ...tmpDirtyVotes],
              queue: {
                ...prevState.queue,
                tps: state.queue.tps.slice(requestLimit)
              },
            }
          });
        })
    } catch(e) {
      setState((prevState) => {
        return {
          ...prevState,
          loading: false,
          error: true,
        }
      });
      console.log(e);
    }
  }

  useEffect(() => {
    fetchProvince();
  }, []);

  useEffect(() => {
    if (state.selectedProvince) {
      initData();
    }
  }, [state.selectedProvince]);

  useEffect(() => {
    if (
        (state.queue.kelurahan.length > 0)
        && !state.loading
      ) {
        fetchQueueKelurahan();
    }
  }, [state.queue.kelurahan, state.loading]);

  useEffect(() => {
    if (
        (!state.queue.kelurahan.length)
        && (state.dirtyVotes.length < 10)
        && (state.queue.tps.length > 0)
        && !state.loading
      ) {
      fetchQueueTps();
    }
  }, [state.queue.kelurahan, state.queue.tps, state.dirtyVotes, state.loading]);

  console.log(state);

  return (
    <div
      className="App"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '72px 24px 42px 24px',
      }}
    >
      <Status state={state} />
      <div>
        <Alert severity="warning">
          Tidak disarankan untuk device dengan spesifikasi low, karena pada sistem ini melakukan network request hingga 500 request++ (ugal-ugalan) dalam satu waktu secara terus menerus. Jika dipaksakan maka kemungkinan besar berpotensi mendapat response request timeout atau lag.
        </Alert>
      </div>
      <div
        style={{
          marginTop: '24px',
        }}
      >
        <ComboBox
          state={state}
          setState={setState}
          options={state.provinceList}
          disabled={state.loading || !state.provinceList.length || state.queue.kelurahan.length > 0}
        />
      </div>
      <div
        style={{
          marginTop: '18px',
        }}
      >
        <DataTable
          state={state}
          loading={state.loading && (state.dirtyVotes.length > 0)}
          fetchQueueTps={fetchQueueTps}
          requestLimit={requestLimit}
        />
      </div>
    </div>
  );
}
