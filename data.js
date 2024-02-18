export async function fetchProvinces() {
  return await fetch(
    "https://sirekap-obj-data.kpu.go.id/wilayah/pemilu/ppwp/0.json"
  ).then((response) => response.json());
}

export async function fetchRegencies(province) {
  return province
    ? await fetch(
        `https://sirekap-obj-data.kpu.go.id/wilayah/pemilu/ppwp/${province}.json`
      ).then((response) => response.json())
    : [];
}

export async function fetchDistricts(province, regency) {
  return province && regency
    ? await fetch(
        `https://sirekap-obj-data.kpu.go.id/wilayah/pemilu/ppwp/${province}/${regency}.json`
      ).then((response) => response.json())
    : [];
}

export async function fetchVillages(province, regency, district) {
  return province && regency && district
    ? await fetch(
        `https://sirekap-obj-data.kpu.go.id/wilayah/pemilu/ppwp/${province}/${regency}/${district}.json`
      ).then((response) => response.json())
    : [];
}

export async function fetchListTps(province, regency, district, village) {
  return province && regency && district && village
    ? await fetch(
        `https://sirekap-obj-data.kpu.go.id/wilayah/pemilu/ppwp/${province}/${regency}/${district}/${village}.json`
      ).then((response) => response.json())
    : [];
}

export async function fetchTpsInfo(province, regency, district, village, tps) {
  return province && regency && district && village && tps
    ? await fetch(
        `https://sirekap-obj-data.kpu.go.id/pemilu/hhcw/ppwp/${province}/${regency}/${district}/${village}/${tps}.json`
      ).then((response) => response.json())
    : null;
}

export async function fetchTpsInfoFromKawalPemilu(village) {
  const data = await fetch(
    `https://kp24-fd486.et.r.appspot.com/h?id=${village}`
  )
    .then((response) => response.json())
    .then((result) => result.result.aggregated);

  const result = [];

  for (const [key, item] of Object.entries(data)) {
    if (item?.length) {
      result.push({
        tps: `${village}${key.padStart("3", "0")}`, //sesuaikan dengan id tps kpu
        ...item[0],
      });
    }
  }

  return result;
}

const paslons = {
  satu: "100025",
  dua: "100026",
  tiga: "100027",
  100025: {
    ts: "2024-02-17 16:00:02",
    nama: "H. ANIES RASYID BASWEDAN, Ph.D. - Dr. (H.C.) H. A. MUHAIMIN ISKANDAR",
    warna: "#8CB9BD",
    nomor_urut: 1,
  },
  100026: {
    ts: "2024-02-17 16:00:02",
    nama: "H. PRABOWO SUBIANTO - GIBRAN RAKABUMING RAKA",
    warna: "#C7B7A3",
    nomor_urut: 2,
  },
  100027: {
    ts: "2024-02-17 16:00:02",
    nama: "H. GANJAR PRANOWO, S.H., M.I.P. - Prof. Dr. H. M. MAHFUD MD",
    warna: "#B67352",
    nomor_urut: 3,
  },
};

export async function getDataTps(province, regency, district, village) {
  const listResult = [];

  const listTps = await fetchListTps(province, regency, district, village);

  const tpsInfoFromKpu = await Promise.all(
    listTps.map((tps) =>
      fetchTpsInfo(province, regency, district, village, tps.kode)
    )
  );

  const tpsInfoFromKawalPemilu = await fetchTpsInfoFromKawalPemilu(village);

  for (let i = 0; i < listTps.length; i++) {
    const item = listTps[i];
    const tpsKpu = tpsInfoFromKpu[i];
    const tpsKawalPemilu = tpsInfoFromKawalPemilu.find(
      (x) => x.tps === item.kode
    );

    listResult.push({
      tps: item.nama,
      kpu: {
        p1: tpsKpu?.chart?.[paslons.satu] ?? "-",
        p2: tpsKpu?.chart?.[paslons.dua] ?? "-",
        p3: tpsKpu?.chart?.[paslons.tiga] ?? "-",
        link: `https://pemilu2024.kpu.go.id/pilpres/hitung-suara/${province}/${regency}/${district}/${village}/${item.kode}`,
      },
      kawalPemilu: {
        p1: tpsKawalPemilu?.pas1 ?? "-",
        p2: tpsKawalPemilu?.pas2 ?? "-",
        p3: tpsKawalPemilu?.pas3 ?? "-",
        link: `https://kawalpemilu.org/h/${item.kode}`
      },
    });
  }

  return listResult;
}
