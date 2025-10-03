import {firestore} from '@/firebase';
import {collection, doc, getDoc, getDocs, query, where} from 'firebase/firestore';


export default async function loadLobbyData(lobbyName: string = 'All Lobbies'){
    interface LobbyDataItem {
        srNo?: number;
        payDate?: string;
        lobby: string;
        sfaId: string;
        name?: string;
        receiver: string;
        amount: number;
        paymentMode:string;
        remarks:string;
    }
    interface UserData {
        name?: string;
    }
    

    try{
        const collectionRef = collection(firestore,'transactions_sept_2025');

        let querySnapshot;
        if( lobbyName === 'All Lobbies'){
            querySnapshot = await getDocs(collectionRef);
        }else {
            const q = query(collectionRef, where('lobby','==',lobbyName));
            querySnapshot = await getDocs(q);
        }
        let srNo = 0;
        const lobbyData: LobbyDataItem[] = [];
        for(const docSnapshot of querySnapshot.docs){
            srNo++;
            const data = docSnapshot.data();
            let userData: UserData = {};
            if(data.sfaId){
                const userDocRef = doc(firestore,'members',data.sfaId);
                const userDocSnap = await getDoc(userDocRef);
                if(userDocSnap.exists()){
                    userData = userDocSnap.data() as UserData;
                }
            }
            lobbyData.push({
                srNo: srNo,
                payDate: data.date,
                lobby: data.lobby || lobbyName,
                sfaId: data.sfaId,
                name: userData.name || 'Unkown',
                receiver: data.receiver,
                amount: data.amount,
                paymentMode: data.mode,
                remarks: data.remarks || ''

            });
        }
        return lobbyData;

    }catch(error){
        console.error("Error loading lobby data :",error);
        return[];
    }


} 