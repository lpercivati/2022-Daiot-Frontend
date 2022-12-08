import { ApiInstnace } from "./../utils"
import useSWR from "swr"

//const EP = "/dispositivos"
const EP = "/prod/metrics"

export const padTo2Digits = (num: number) => {
    return num.toString().padStart(2, '0');
  }

export const getDate = (timeStamp: number) => {
    let date = new Date(timeStamp * 1000);
   
    return [
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getMonth() + 1),
        date.getFullYear(),
      ].join('/');
}

export const getMonth = (timeStamp: number) => {
    let date = new Date(timeStamp * 1000);
    return date.getMonth() + 1
}

//obtener todos los dispositivos
export const useDispositivoList = () => {
    const { data, mutate: mutateDispositivos } = useSWR(EP);
    const dispositivos = data?.data;
    return { dispositivos, mutateDispositivos }
}

//obtener un dispositivo unico.
export const getMetrics = (id: any) => {
    let finalMetrics = []
    const { data, mutate: mutateMetrics } = useSWR(`${EP}`);
    console.log(data)
    const metrics = data?.Items.map(x => ({ 
        fecha: getMonth(x.device_data.fecha),
        temp: x.device_data.temp,
        humedad: x.device_data.humidity
    
    }));

    const grouped = metrics?.reduce((group, metric) => {
        const { fecha } = metric;
        group[fecha] = group[fecha] ?? [];
        group[fecha].push(metric);
        return group;
      }, {});

      if (grouped) {
        let noviembreTempAverage = grouped[11].map(x => x.temp).filter(Boolean).reduce((total, next) => total + next, 0) / grouped[11].length;
        let noviembreHumidityAverage = grouped[11].map(x => x.humedad).filter(Boolean).reduce((total, next) => total + next, 0) / grouped[11].length;

        let diciembreTempAverage = grouped[12].map(x => x.temp).filter(Boolean).reduce((total, next) => total + next, 0) / grouped[12].length;
        let diciembreHumidityAverage = grouped[12].map(x => x.humedad).filter(Boolean).reduce((total, next) => total + next, 0) / grouped[12].length;

        finalMetrics.push(["Mes", "Temperatura", "Humedad"])
        finalMetrics.push(["11", noviembreTempAverage, noviembreHumidityAverage])
        finalMetrics.push(["12", diciembreTempAverage, diciembreHumidityAverage])
      }
     
    return { finalMetrics, mutateMetrics }
}