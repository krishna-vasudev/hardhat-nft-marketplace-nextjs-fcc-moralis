//@ts-nocheck
import React, { useEffect, useState } from 'react'
import {nftAbi,nftMarketplaceAbi} from "../../../constants"
import { useMoralis, useWeb3Contract } from 'react-moralis'
import Image from 'next/image'
import {Card,useNotification} from '@web3uikit/core';
import { ethers } from 'ethers';
import UpdateListingModal from './UpdateListingModal';

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    const seperatorLength = separator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

//@ts-expect-error
export default function NFTBox({price,nftAddress,tokenId,marketPlaceAddress,seller}) {
    const dispatch=useNotification()
    const {isWeb3Enabled,account}=useMoralis()
    const [imageURI,setImageURI]=useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [showModal, setShowModal] = useState(false)
    const hideModal = () => setShowModal(false)

    // console.log(nftAbi)
    const {runContractFunction:getTokenURI,error}=useWeb3Contract(
        {
            abi:nftAbi,
            contractAddress:nftAddress,
            functionName:"tokenURI",
            params:{
                tokenId:tokenId
            }
        }
    )

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketPlaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })

    console.log("error "+error)
    async function updateUI() {
        const tokenURI = await getTokenURI()
        console.log(`The TokenURI is ${tokenURI}`)
        // We are going to cheat a little here...
        if (tokenURI) {
            // IPFS Gateway: A server that will return IPFS files from a "normal" URL.
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenURIResponse = await (await fetch(requestURL)).json()
            const imageURI = tokenURIResponse.image
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            setImageURI(imageURIURL)
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
            // console.log(imageURIURL)
            // We could render the Image on our sever, and just call our sever.
            // For testnets & mainnet -> use moralis server hooks
            // Have the world adopt IPFS
            // Build our own IPFS gateway
        }
        // get the tokenURI
        // using the image tag from the tokenURI, get the image
    }


    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const isOwnedByUser = seller === account || seller === undefined
    const formattedSellerAddress = isOwnedByUser ? "you" : truncateStr(seller || "", 15)

    const handleCardClick = () => {
        isOwnedByUser
            ? setShowModal(true)
            :buyItem({
                onError: (error) => console.log(error),
                onSuccess: handleBuyItemSuccess,
            })
    }

    const handleBuyItemSuccess = async (tx) => {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Item bought!",
            title: "Item Bought",
            position: "topR",
        })
    }

  return (
    <div>
        <div className='p-2'>
            {imageURI?
            <div>
                <UpdateListingModal 
                isVisible={showModal}
                tokenId={tokenId}
                marketplaceAddress={marketPlaceAddress}
                nftAddress={nftAddress}
                onClose={hideModal}
                />
                <Card 
                title={tokenName} 
                description={tokenDescription} 
                onClick={handleCardClick}
                >
                    <div className="p-2">
                        <div className="flex flex-col items-end gap-2">
                            <div>#{tokenId}</div>
                            <div className="italic text-sm">
                                Owned by {formattedSellerAddress}
                            </div>
                            <Image
                            loader={() => imageURI}
                            src={imageURI}
                            height="200"
                            width="200"
                            />
                            <div className="font-bold">
                                {ethers.formatUnits(price, "ether")} ETH
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
            :<div>Loading...</div>}
        </div>
    </div>
  )
}
