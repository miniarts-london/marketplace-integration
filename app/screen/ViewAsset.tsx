'use client'

import React, { useState, useEffect } from 'react'
import { assetTypes } from '../config'
import { ViewLayout } from '../components/ViewLayout'
import { ViewKpi } from '../components/ViewKpi'
import { ViewStoryboard } from '../components/ViewStoryboard'
import { ViewChart } from '../components/ViewChart'
import { AssetDetail } from '../models/assets'
import { ChartData } from '../models/charts'
import { fetchMetricData } from '../utils/requests'
import { setIcon } from '../components/Helper'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { selectIsFavourite, toggleFavourite } from '../store/favouritesSlice'

export function ViewAssetScreen ({data, assetType}: {data: AssetDetail, assetType: string}) {
    const [metrics, setMetrics] = useState<ChartData[]>([])
    const dispatch = useAppDispatch()
    const isFavourite = useAppSelector(selectIsFavourite(data.id))

    useEffect(()=> {
        const getMetricsData = async()=>{
            // const metricsData = await fetchMetricData(data.id, false)
            const res = await fetchMetricData() //temp
            setMetrics(res?.metricData?.data)
        }

        if(data?.id){
            getMetricsData()
        }
        
    }, [data])

    const handleClickFavourite = () => {
        dispatch(toggleFavourite({ id: data.id, name: data.name }))
    }

    return (
        <div className="grid place-content-center">
            <div className="top-20 shadow-xl bg-white max-w-3xl p-6" >
                <div className='text-center'>
                    <div className='grid place-content-center mb-2'>
                        <span className='bg-gray-100 rounded p-1'>
                            {setIcon(data.asset_type)}
                        </span>
                    </div>
                    <h2 className="title text-3xl font-semibold text-gray-900 flex justify-center items-center gap-3">
                        {data.name} 
                        <span className="bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">{data.asset_type}</span>
                    </h2>
                    <p className="text-gray-400 text-sm">{data.description_short}</p>
                    <p className="text-gray-600 mt-5 mx-5">{data.description}</p>
                </div>

                {assetType === assetTypes[1] && <ViewKpi data={data}/>}
                {assetType === assetTypes[2] && <ViewLayout data={data}/>}
                {assetType === assetTypes[3] && <ViewStoryboard data={data}/>}
                {assetType.includes('Chart') && <ViewChart data={data} metrics={metrics}/>}

                <button type="submit" onClick={handleClickFavourite} className="inline-flex w-full items-center justify-center rounded-lg bg-black p-2 py-3 text-white gap-3">
                    <svg className="h-6 w-6 text-gray-200"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
                    </svg>
                    {isFavourite ? 'Remove favourite' : 'Favourite item'}
                </button>
            </div>
        </div>
    )
}