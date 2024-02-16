import { useState, useEffect } from "react";

export default function App() {
  const numberOnly = new RegExp(/^\d+$/);
  const [provinceId, setProvinceId] = useState(91);
  const [state, setState] = useState({
    loading: false,
    error: false,
    dirtyVotes: [],
    queue: [],
  });

  async function fetchTps() {
    setState((prevState) => {
      return {
        ...prevState,
        loading: true,
      }
    });
    try {
      const apiUrl = `https://sirekap-obj-data.kpu.go.id/pemilu/hhcw/ppwp/${provinceId}`;
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
              const kelurahanPromiseList = [];
              resKecamatan.forEach((kecamatan) => {
                Object.keys(kecamatan?.table)?.forEach(async (kelurahanId) => {
                  if (numberOnly.test(kelurahanId)) {
                    const kelurahanPromise = fetch(`${kecamatan.url}/${kelurahanId}.json`)
                      .then(async (resKelurahan) => {
                        const resultKelurahan = await resKelurahan.json();
                        return {
                          ...resultKelurahan,
                          url: `${kecamatan.url}/${kelurahanId}`,
                        }
                      });
                    kelurahanPromiseList.push(kelurahanPromise);
                  }
                });
              })
              Promise.all(kelurahanPromiseList)
                .then((resKelurahan) => {
                  const tpsList = [];
                  resKelurahan.forEach((kelurahan) => {
                    Object.keys(kelurahan?.table)?.forEach(async (tpsId) => {
                      if (numberOnly.test(tpsId)) {
                        tpsList.push({
                          url: `${kelurahan.url}/${tpsId}.json`,
                        })
                      }
                    });
                  })
                  setState((prevState) => {
                    return {
                      ...prevState,
                      queue: tpsList,
                      loading: false,
                    }
                  });
                })
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

  useEffect(() => {
    if (provinceId) {
      fetchTps();
    }
  }, [provinceId]);

  console.log(state);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
    </div>
  );
}
