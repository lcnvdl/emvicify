class AsyncHelper {
    /**
     * @param {[]} array Array
     * @param {Function} callback Callback
     */
    static async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, array);
        }
    }

    static async waitFor(conditionFn, timeout, delay) {
        let totalTime = 0;

        timeout = timeout || 0;
        delay = delay || 100;

        while (!conditionFn() && (!timeout || totalTime < timeout)) {
            await AsyncHelper.sleep(delay);

            if (timeout > 0) {
                totalTime += delay;
            }
        }

        return !timeout || (totalTime < timeout);
    }

    static async sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(() => resolve(), ms);
        });
    }
}

module.exports = AsyncHelper;