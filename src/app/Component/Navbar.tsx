import { Button, Flex, Space } from "antd";
import "../styles/home.css"

export default function Navbar(){
    return (
        <div style={{ paddingInline : "20px" , backgroundColor : "transparent"}}>
            <Flex align="center" justify="space-between">
                <h1 className="logo">Orion</h1>
                <Space>
                    <Button className="hero-btn">Contribute</Button>
                    <Button className="hero-btn" style={{ color : "rgb(233, 65, 255)" , borderColor : "rgb(233, 65, 255)" }}>Share</Button>
                </Space>            
            </Flex>
        </div>
    )
}