'use client'

import React, { useState, useEffect, Suspense, lazy, useTransition } from 'react'
import { SectionAssetList } from '../components/SectionAssetList'
import { assetTypes, showMoreNum, initAssetNum } from '../config'
import { AssetList, ModalDataProps } from '../models/assets'
import { Request } from '../components/Request'
import { FavouritesBar } from '../components/FavouritesBar'
import { analyticsInit, analyticsLogEvent } from '../analytics'

const Modal = lazy(() =>
  import('../components/Modal').then((mod) => ({ default: mod.Modal }))
)

export function Library({ data }: {data: AssetList[]}) {   
  const [loadedData, setLoadedData] = useState<AssetList[]>(data?.slice(0, initAssetNum))
  const [searchResult, setSearchResult] = useState<AssetList[]>()
  const [searchResultMessage, setSearchResultMessage] = useState<string>('')
  const [assetNum, setAssetNum] = useState(initAssetNum)
  const [assetType, setAssetType] = useState(assetTypes[0])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalData, setModalData] = useState<ModalDataProps>()
  const [showMore, setShowMore] = useState(false)
  const [requestOpen, setRequestOpen] = useState(false)
  
  const [featuredAssets, setFeaturedAssets] = useState<AssetList[]>()
  const [kpiAssets, setKpiAssets] = useState<AssetList[]>()
  const [layoutsAssets, setLayoutsAssets] = useState<AssetList[]>()
  const [storyboardsAssets, setStoryboardsAssets] = useState<AssetList[]>()

  const [, startTransition] = useTransition()

  useEffect(() => {
    void analyticsInit()
  }, [])

  useEffect(() => {
    //if the loaded data number is less than cached data, show "show more" link
    setShowMore(data.length > loadedData.length)
  }, [data, loadedData])

  useEffect(() => {
    //when assets are loaded, update and set each assetList
    const featureAssets = loadedData?.filter((item: AssetList) => item.featured === true)
    setFeaturedAssets(featureAssets)
    const kpiAssets = loadedData?.filter((item: AssetList)  => item.asset_type === assetTypes[1])
    setKpiAssets(kpiAssets)
    const layoutsAssets = loadedData?.filter((item: AssetList)  => item.asset_type === assetTypes[2])
    setLayoutsAssets(layoutsAssets)
    const storyboardsAssets = loadedData?.filter((item: AssetList)  => item.asset_type === assetTypes[3])
    setStoryboardsAssets(storyboardsAssets)
  }, [loadedData])

  const handleOpenModal = (e:React.MouseEvent<HTMLElement>, item:{id: number, asset_type: string}) => {
    setModalOpen(true)
    setModalData(item)
    setAssetType(item.asset_type)
  }

  const handleShowMore = (e:React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const num = loadedData?.length + showMoreNum
    setAssetNum(num)
    setShowMore(data.length > num)
    setLoadedData(data?.slice(0, num))
  }
  
  const handleSelect = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setAssetType(e.currentTarget.id)
    analyticsLogEvent('Tab_clicked', {
      activeTab: e.currentTarget.id,
    })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const searchString = e.target.value
    if (searchString && searchString !== '') {
      startTransition(() => {
        const filtered = data?.slice(0, assetNum).filter((item: AssetList) =>
          item.name.toLowerCase().includes(searchString.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchString.toLowerCase())
        )
        setSearchResultMessage(filtered.length ? '' : 'No matching result')
        setSearchResult(filtered)
      })
    } else {
      setSearchResult([])
    }
  }

  let assetData : AssetList[] = loadedData

  switch(assetType) { 
    case assetTypes[0]: { 
       assetData = featuredAssets || []
       break; 
    } 
    case assetTypes[1]: { 
      assetData = kpiAssets || []
       break; 
    } 
    case assetTypes[2]: { 
      assetData = layoutsAssets || []
       break; 
    } 
    case assetTypes[3]: { 
      assetData = storyboardsAssets || []
       break; 
    } 
    default: { 
      assetData = loadedData || []
       break; 
    } 
  } 

  return (
    <>
      <div className="items-center flex flex-col mt-10">
          <div className="relative w-full">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
              </div>
              <input 
                type="search" 
                id="search" 
                onChange={(e)=>handleSearch(e)} 
                className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 " 
                placeholder="Type to search..."  

              />
          </div>
      </div>
      <FavouritesBar />
    
    <p className='text-red-500'>
      {searchResultMessage}
    </p>

    { searchResult?.length ? (
      <>
        {
          featuredAssets &&
            <SectionAssetList 
              assets={searchResult} 
              title={'Search results'} 
              handleOpenModal={
                (e, item)=>{
                handleOpenModal(e, item)
              }
            }
            />
        }
      </>
      ) : ( 
        <>
          <div className="items-center flex flex-col mt-10"> 
            <ul className="text-center text-gray-500 bg-gray-300 p-2 w-full md:grid grid-cols-4 place-items-stretch rounded-lg">
                {
                  assetTypes.map((item, i) => {
                    return(
                      <li className="me-2 " key={i}>
                        <a 
                          href="#" 
                          id={item} 
                          onClick={(e)=>handleSelect(e)} 
                          className={`${assetType===item?'text-black bg-white rounded-lg':''} grid p-2`}>
                            {item}
                        </a>
                      </li>
                    )
                  })
                }
            </ul>
          </div>
          { 
            assetData && <SectionAssetList 
                assets={assetData} 
                title={assetType} 
                handleOpenModal={
                  (e, item)=>{
                  handleOpenModal(e, item)
                }}
              />
          }
        </>
        )
      }

      <div className="items-center flex flex-col mt-20"> 
        <a href="#" onClick={(e)=>handleShowMore(e)} className={`${showMore?'':'hidden'} bg-black text-white py-2 px-10 rounded-lg`} >
          Show more
        </a>
      </div>

      {modalData && (
        <Suspense fallback={<div className="p-4">Loading asset…</div>}>
          <Modal open={modalOpen} data={modalData} assetType={assetType} setModalOpen={setModalOpen} />
        </Suspense>
      )}
      <Request requestOpen={requestOpen} setRequestOpen={setRequestOpen}/>
    </>
  )
}
