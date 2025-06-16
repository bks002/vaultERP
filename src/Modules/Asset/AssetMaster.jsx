import {useSelector} from "react-redux";

const AssetMaster =()=>{
    const officeId = useSelector((state) => state.user.officeId);
    console.log("AssetMaster");
    return (
        <div className="bg-white">
            <h1>AssetMaster Master {officeId}</h1>
        </div>
    )
}
export default AssetMaster;