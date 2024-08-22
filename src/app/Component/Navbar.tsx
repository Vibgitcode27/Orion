import { Button, Flex, Space } from "antd";
import "../styles/home.css"

export default function Navbar(){
    return (
        <div style={{ paddingInline : "20px"}}>
            <Flex align="center" justify="space-between">
                <h1 className="logo">Orion</h1>
                <Space>
                    <Button className="nav-btn">Contribute</Button>
                    <Button className="nav-btn" style={{ color : "rgb(233, 65, 255)" , borderColor : "rgb(233, 65, 255)" }}>Share</Button>
                </Space>            
            </Flex>
        </div>
    )
}