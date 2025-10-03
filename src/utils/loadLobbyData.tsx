import {firestore} from '@/firebase';
import {collection, getDocs, query, where} from 'firebase/firestore';


export default async function loadLobbyData(lobbyName: string = 'All Lobbies'){
    interface LobbyDataItem {
        srNo?: number;
        payDate?: string;
        lobby: string;
        sfaId: string;
        name?: string;
        cmsId?: string;
        receiver: string;
        amount: number;
        paymentMode:string;
        remarks:string;
    }
    interface UserData {
        full_name?: string;
        cms_id?: string;
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
                const userQuery = query(collection(firestore,'users'), where('sfa_id','==',data.sfaId));
                const userSnapshot = await getDocs(userQuery);
                if(!userSnapshot.empty){
                    userData = userSnapshot.docs[0].data() as UserData;
                }
            }
            lobbyData.push({
                srNo: srNo,
                payDate: data.date,
                lobby: data.lobby || lobbyName,
                sfaId: data.sfaId,
                name: userData.full_name || 'Unknown',
                cmsId: userData.cms_id || '-',
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