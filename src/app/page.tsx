//@ts-nocheck
'use client';
import Image from "next/image";
import { fetchSubgraphData } from "../../lib/getActiveItems";
import { useState } from "react";
import NFTBox from "./components/NFTBox";
import React from "react";
import { useMoralis } from "react-moralis";
import {networkMapping} from "../../constants"

export default function Home() {
  const { chainId, isWeb3Enabled } = useMoralis()
  const chainString = chainId ? parseInt(chainId).toString() : null
  //@ts-expect-error
  // console.log(chainId)
  const marketplaceAddress = chainId ? networkMapping[chainString].NftMarketplace[0] : null
  const [listedNfts,setListedNfts]=useState([])
  fetchSubgraphData().then((data) => {
    //@ts-expect-error
    if (JSON.stringify(data.activeItems) !== JSON.stringify(listedNfts)){
    //@ts-expect-error
    setListedNfts(data.activeItems)
    }
  }).catch(console.error)
  console.log(listedNfts)
  return (
    <div className="container mx-auto">
      <h1 className="py-4 px-4 font-bold text-2xl">Recently Listed</h1>
      {isWeb3Enabled && chainId ?
      (<div className="flex flex-wrap">
        {listedNfts.map(nft=>{
          const { price, nftAddress, tokenId, seller,id } = nft
          return(
            <NFTBox
                price={price}
                nftAddress={nftAddress}
                tokenId={tokenId}
                marketPlaceAddress={marketplaceAddress}
                seller={seller}
                key={id}
            />
          )
        })}
      </div>):(<div>Web3 Currently not available</div>)}
    </div>
  );
}
