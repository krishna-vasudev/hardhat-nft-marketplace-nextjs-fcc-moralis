//@ts-nocheck
"use client";
import Image from "next/image";
import { Form, useNotification, Button } from "@web3uikit/core"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import {nftAbi,nftMarketplaceAbi,networkMapping} from "../../../constants"
import { useEffect, useState } from "react"
import { title } from "process";


export default function Home() {
  const { chainId, account, isWeb3Enabled } = useMoralis()
  const chainString = chainId ? parseInt(chainId).toString() : "31337"
  const marketplaceAddress = networkMapping[chainString].NftMarketplace[0]
  const dispatch = useNotification()
  const [proceeds, setProceeds] = useState("0")

  const { runContractFunction } = useWeb3Contract()



  async function approveAndList(data) {
    console.log("Approving...")
    const nftAddress = data.data[0].inputResult
    const tokenId = data.data[1].inputResult
    const price = ethers.parseUnits(data.data[2].inputResult, "ether").toString()

    const approveOptions = {
        abi: nftAbi,
        contractAddress: nftAddress,
        functionName: "approve",
        params: {
            to: marketplaceAddress,
            tokenId: tokenId,
        },
    }

    await runContractFunction({
        params: approveOptions,
        onSuccess: (tx) => handleApproveSuccess(tx, nftAddress, tokenId, price),
        onError: (error) => {
            console.log(error)
        },
    })
  }

async function handleApproveSuccess(tx, nftAddress, tokenId, price) {
  console.log("Ok! Now time to list")
  await tx.wait()
  const listOptions = {
      abi: nftMarketplaceAbi,
      contractAddress: marketplaceAddress,
      functionName: "listItem",
      params: {
          nftAddress: nftAddress,
          tokenId: tokenId,
          price: price,
      },
  }

  await runContractFunction({
      params: listOptions,
      onSuccess: (tx) => handleListSuccess(tx),
      onError: (error) => console.log(error),
  })
  }

  async function handleListSuccess(tx) {
    await tx.wait(1)
    dispatch({
        type: "success",
        message: "NFT listing",
        title: "NFT listed",
        position: "topR",
    })
  }


  const handleWithdrawSuccess = async (tx) => {
    // console.log("test...")
    await tx.wait(1)
    dispatch({
        type: "success",
        message: "Withdrawing proceeds",
        title:"Withdrawn proceeds",
        position: "topR",
    })

    setupUI()

  }

async function setupUI() {
    const returnedProceeds = await runContractFunction({
        params: {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "getProceeds",
            params: {
                seller: account,
            },
        },
        onError: (error) => console.log(error),
    })
    if (returnedProceeds) {
        setProceeds(returnedProceeds.toString())
    }
  }


  useEffect(() => {
    setupUI()
  }, [proceeds, account, isWeb3Enabled, chainId])

  return (
    <div className="p-4">
            <Form
                onSubmit={approveAndList}
                buttonConfig={{
                  theme: 'primary'
                }}
                data={[
                    {
                        name: "NFT Address",
                        type: "text",
                        inputWidth: "50%",
                        value: "",
                        key: "nftAddress",
                    },
                    {
                        name: "Token ID",
                        type: "number",
                        value: "",
                        key: "tokenId",
                    },
                    {
                        name: "Price (in ETH)",
                        type: "number",
                        value: "",
                        key: "price",
                    },
                ]}
                title="Sell your NFT!"
                id="Main Form"
            />
      <div className="my-4">Withdraw {ethers.formatEther(proceeds)} ETH proceeds</div>
            {proceeds != "0" ? (
                <Button
                    theme='colored'
                    onClick={async () => {
                        await runContractFunction({
                            params: {
                                abi: nftMarketplaceAbi,
                                contractAddress: marketplaceAddress,
                                functionName: "withdrawProceeds",
                                params: {},
                            },
                            onError: (error) => console.log(error),
                            onSuccess: handleWithdrawSuccess,
                        })
                    }}
                    text="Withdraw"
                    color="red"
                    type="button"
                />
            ) : (
                <div>No proceeds detected</div>
            )}
    </div>
  );
}
