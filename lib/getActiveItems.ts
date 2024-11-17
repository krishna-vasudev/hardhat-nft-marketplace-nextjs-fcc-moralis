import { gql, request } from 'graphql-request'
const query = gql`{
  activeItems(first: 50 ,orderBy: id, orderDirection: desc,where: { buyer: "0x0000000000000000000000000000000000000000" }){
    id
    seller
    buyer
    nftAddress
    tokenId
    price
  }
}`
const url = 'http://localhost:8000/subgraphs/name/nft-marketplace/'
export async function fetchSubgraphData() {
  return await request(url, query)
}
// fetchSubgraphData().then((data) => console.log({data})).catch(console.error)
      