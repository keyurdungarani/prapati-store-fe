import Header from "../layout/Header";
import OrderManager from "./Order";

export default function OrderScreen() {
    return (
        <div className="space-y-8">
            <Header />
            <OrderManager />
        </div>
    );
}