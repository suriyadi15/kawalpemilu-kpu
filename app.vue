<script setup>
import { fetchProvinces, fetchRegencies, fetchDistricts, fetchVillages, getDataTps } from './data'

const filter = reactive({ province: null, regency: null, district: null, village: null })

const regions = reactive({
  provinces: [],
  regencies: [],
  districts: [],
  villages: [],
})

const tables = ref([])
const tableHeaders = [
  {
    title: 'TPS',
    value: 'tps'
  },
  {
    title: 'pemilu2024.kpu.go.id',
    children: [
      {
        title: 'P1',
        value: 'kpu.p1'
      },
      {
        title: 'P2',
        value: 'kpu.p2'
      },
      {
        title: 'P3',
        value: 'kpu.p3'
      },
      {
        title: 'Link',
        value: 'kpu.link',
        key: 'linkKpu'
      },
    ]
  },
  {
    title: 'kawalpemilu.org',
    children: [
      {
        title: 'P1',
        value: 'kawalPemilu.p1'
      },
      {
        title: 'P2',
        value: 'kawalPemilu.p2'
      },
      {
        title: 'P3',
        value: 'kawalPemilu.p3'
      },
      {
        title: 'Link',
        value: 'kawalPemilu.link',
        key: 'linkKawalPemilu'
      },
    ]
  },
]


await useLazyAsyncData(() => fetchProvinces()).then(result => {
  regions.provinces = result.data
})


watch(() => filter.province, async (value) => {
  regions.regencies = await fetchRegencies(value)
  regions.districts = await fetchDistricts(filter.province, filter.regency)
  regions.villages = await fetchVillages(filter.province, filter.regency, filter.district)

  filter.regency = null
  filter.district = null
  filter.village = null
})
watch(() => filter.regency, async (value) => {
  regions.districts = await fetchDistricts(filter.province, value)
  regions.villages = await fetchVillages(filter.province, filter.regency, filter.district)

  filter.district = null
  filter.village = null
})
watch(() => filter.district, async (value) => {
  regions.villages = await fetchVillages(filter.province, filter.regency, value)

  filter.village = null
})

const getTableTps = async () => {
  if (!filter.village) return []
  const listTps = await getDataTps(filter.province, filter.regency, filter.district, filter.village)

  tables.value = listTps
}

watch(() => filter.village, async (value) => {
  getTableTps()
})
</script>

<template>
  <NuxtLayout>
    <v-app>
      <v-app-bar :elevation="2">
        <v-app-bar-title>KPU X KawalPemilu</v-app-bar-title>
      </v-app-bar>

      <v-main>
        <v-form v-model="valid">
          <v-container>
            <v-row>
              <v-col cols="12" md="3">
                <v-autocomplete v-model="filter.province" clearable label="Provinsi" :items="regions.provinces"
                  item-title="nama" item-value="kode"></v-autocomplete>
              </v-col>

              <v-col cols="12" md="3">
                <v-autocomplete v-model="filter.regency" clearable label="Kabupaten/Kota" :items="regions.regencies"
                  item-title="nama" item-value="kode"></v-autocomplete>
              </v-col>

              <v-col cols="12" md="3">
                <v-autocomplete v-model="filter.district" clearable label="Kecamatan" :items="regions.districts"
                  item-title="nama" item-value="kode"></v-autocomplete>
              </v-col>
              <v-col cols="12" md="3">
                <v-autocomplete v-model="filter.village" clearable label="Kelurahan/Desa" :items="regions.villages"
                  item-title="nama" item-value="kode"></v-autocomplete>
              </v-col>
            </v-row>
          </v-container>
        </v-form>

        <v-data-table :headers="tableHeaders" :items="tables" :items-per-page="100">
          <template v-slot:item.linkKawalPemilu="{ value }">
            <v-btn icon="mdi-open-in-new" :href="value" variant="text" size="x-small" target="_blank">
            </v-btn>
          </template>
          <template v-slot:item.linkKpu="{ value }">
            <v-btn icon="mdi-open-in-new" :href="value" variant="text" size="x-small" target="_blank">
            </v-btn>
          </template>
        </v-data-table>
        <v-footer>Copyright © 2024 | Data diambil dari web <a
            href="https://pemilu2024.kpu.go.id/">pemilu2024.kpu.go.id/</a> dan <a
            href="https://kawalpemilu.org/">kawalpemilu.org/</a></v-footer>
      </v-main>
    </v-app>
  </NuxtLayout>
  <NuxtPage />
</template>
