"use client"
import { useAppDispatch , useAppSelector } from "../../lib/hooks";
import { Button, Flex, Image, Space } from "antd";
import heroImg from "../assets/Clipped_image_20240822_061749.png";
import "../styles/home.css"
import { useRouter } from "next/navigation";

export default function Page0(){
  const dispatch = useAppDispatch();
  const router = useRouter();


  return(
        <>
            <Flex
          justify="space-between"
          align="center"
          style={{
            marginInline: "70px",
            marginTop: "-700px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <Flex
            vertical
            style={{
              color: "white",
            }}
          >
            <h1 style={{ fontSize: "75px", margin: "0" }}>
              Crypto <span style={{ color: "rgb(233, 65, 255)" }}>S*_*curity</span>
            </h1>
            <h1 style={{ fontSize: "75px", margin: "0" }}>made easy</h1>
            <p style={{ marginTop : "20px" }}>
              Keep your coins safe and secure with Orion Wallet and backup solutions,
            </p>
            <p style={{ margin: "0" }}>
              ensuring reliable storage, management, and protection.
            </p>
            <Space style={{ marginTop : "40px"}}>
              <Button onClick={() => { router.push("/generateSeed")  }}  className="nav-btn" style={{ backgroundColor : "white" , color : "black" ,  fontSize : "18px" , width : "220px" , fontWeight : "bolder"}}>Create a new Wallet</Button>
              <Button onClick={() => {router.push("/importWallet")}} className="nav-btn" style={{ borderColor : "orangered" , color : "orangered" , fontSize : "18px" , width : "180px"}}>Import Wallet</Button>
            </Space>
          </Flex>

          <Image
            preview = {false}
            src={heroImg.src}
            style={{
              width: "700px",
              height: "auto",
              marginTop: "0px",
            }}
          />
        </Flex>
        </>
    )
}