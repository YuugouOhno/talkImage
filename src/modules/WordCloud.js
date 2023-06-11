import { Image, Button, View, Text, TextInput } from 'react-native';
import KeywordsCloud from './KeywordsCloud';
const WordCloud = () => {
    const keywords = [{
        keyword: 'word1',
        frequency: 120,
        color: 'purple'
    }, {
        keyword: 'word1',
        frequency: 80,
        color: 'green'
    }, {
        keyword: 'word1',
        frequency: 123,
        color: 'yellow'
    }, {
        keyword: 'word1',
        frequency: 123,
        color: 'blue'
    }, {
        keyword: 'word1',
        frequency: 123,
        color: 'red'
    }]
    return (
        <View>
            <KeywordsCloud keywords={keywords} scale={200} largestAtCenter={false} drawContainerCircle={true} containerCircleColor={'gray'}/>
        </View>
    )
}

export default WordCloud